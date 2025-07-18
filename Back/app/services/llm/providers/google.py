# AI Dock Google Provider Implementation
# Handles communication with Google's Gemini AI API

import httpx
import json
import time
from typing import Dict, Any, Optional

from app.models.llm_config import LLMProvider
from ..exceptions import LLMProviderError, LLMConfigurationError, LLMQuotaExceededError
from ..models import ChatRequest, ChatResponse, ChatMessage
from .base import BaseLLMProvider


class GoogleProvider(BaseLLMProvider):
    """
    Google Gemini provider implementation.
    
    Handles communication with Google's Gemini AI API (gemini-1.5-pro, gemini-2.5-flash, etc.)
    """
    
    @property
    def provider_name(self) -> str:
        return "Google"
    
    def _validate_configuration(self):
        """Validate that the necessary configuration for the provider is present."""
        if not self.config.api_key_encrypted:
            raise LLMProviderError("❌ Google AI Studio API key is not configured. Please set up your API key in the configuration.")
        if not self.config.api_endpoint:
            raise LLMProviderError("❌ Google API endpoint is not configured.")
            
        # 🔍 ENHANCED LOGGING: Log configuration details (without exposing full API key)
        api_key = self.config.get_decrypted_api_key()
        key_preview = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "[too_short]"
        self.logger.info(f"🔍 Google config validation - Endpoint: {self.config.api_endpoint}, Key: {key_preview}")
    
    async def send_chat_request(self, request: ChatRequest) -> ChatResponse:
        """
        Send chat request to Google Gemini API.
        
        Google Gemini API format:
        POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
        {
            "contents": [
                {
                    "parts": [{"text": "Hello!"}],
                    "role": "user"
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }
        """
        self._validate_configuration()
        
        # Get model name
        model = request.model or self.config.default_model
        
        # Convert messages to Gemini format
        contents = []
        for msg in request.messages:
            # Map roles: "user" -> "user", "assistant" -> "model", "system" -> "user" (Gemini doesn't have system role)
            role = "model" if msg.role == "assistant" else "user"
            contents.append({
                "parts": [{"text": msg.content}],
                "role": role
            })
        
        # Build request payload in Gemini format
        payload = {
            "contents": contents
        }
        
        # Add generation config
        generation_config = {}
        
        if request.temperature is not None:
            generation_config["temperature"] = request.temperature
        elif self.config.model_parameters and "temperature" in self.config.model_parameters:
            generation_config["temperature"] = self.config.model_parameters["temperature"]
        
        if request.max_tokens is not None:
            generation_config["maxOutputTokens"] = request.max_tokens
        elif self.config.model_parameters and "max_tokens" in self.config.model_parameters:
            generation_config["maxOutputTokens"] = self.config.model_parameters["max_tokens"]
        
        if generation_config:
            payload["generationConfig"] = generation_config
        
        # Add any extra parameters from request
        payload.update(request.extra_params)
        
        # Record start time for performance tracking
        start_time = time.time()
        
        # Make the API request
        async with self._get_http_client() as client:
            try:
                # 🔍 ENHANCED LOGGING: Log exactly what model is being sent to Google API
                self.logger.info(f"🔍 SENDING TO GOOGLE API: model='{model}', config_default='{self.config.default_model}', request_model_override='{request.model}'")
                self.logger.info(f"🔍 Full Google payload: {payload}")
                
                # Google API endpoint format
                api_key = self.config.get_decrypted_api_key()
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                
                # 🔍 ENHANCED LOGGING: Log request details (without exposing API key)
                safe_url = url.replace(api_key, "[API_KEY_HIDDEN]")
                self.logger.info(f"🔍 Making Google API request to: {safe_url}")
                self.logger.info(f"🔍 Request payload size: {len(str(payload))} chars")
                
                response = await client.post(url, json=payload)
                
                response_time_ms = int((time.time() - start_time) * 1000)
                
                # Handle different response status codes
                if response.status_code == 200:
                    return await self._process_success_response(response, response_time_ms, model)
                else:
                    await self._handle_error_response(response)
                    
            except httpx.TimeoutException:
                raise LLMProviderError(
                    "Request timed out",
                    provider=self.provider_name,
                    error_details={"timeout": True}
                )
            except httpx.RequestError as e:
                raise LLMProviderError(
                    f"Network error: {str(e)}",
                    provider=self.provider_name,
                    error_details={"network_error": str(e)}
                )
    
    async def _process_success_response(self, response: httpx.Response, response_time_ms: int, model: str) -> ChatResponse:
        """Process successful Google Gemini API response."""
        data = response.json()
        
        # Extract response content from Gemini format
        content = ""
        candidates = data.get("candidates", [])
        if candidates and candidates[0].get("content"):
            parts = candidates[0]["content"].get("parts", [])
            if parts:
                content = parts[0].get("text", "")
        
        # 🔍 ENHANCED LOGGING: Log what model Google actually used
        self.logger.info(f"🔍 RECEIVED FROM GOOGLE API: model='{model}', content_length={len(content)} chars")
        
        # Extract usage information if available
        usage = {}
        usage_metadata = data.get("usageMetadata", {})
        if usage_metadata:
            usage = {
                "input_tokens": usage_metadata.get("promptTokenCount", 0),
                "output_tokens": usage_metadata.get("candidatesTokenCount", 0),
                "total_tokens": usage_metadata.get("totalTokenCount", 0)
            }
        
        # Calculate cost
        cost = self._calculate_actual_cost(usage)
        
        return ChatResponse(
            content=content,
            model=model,
            provider=self.provider_name,
            usage=usage,
            cost=cost,
            response_time_ms=response_time_ms,
            raw_response=data
        )
    
    async def _handle_error_response(self, response: httpx.Response) -> None:
        """Handle Google Gemini API error responses."""
        try:
            error_data = response.json()
            error_message = error_data.get("error", {}).get("message", "Unknown error")
            error_code = error_data.get("error", {}).get("code", "unknown")
            error_status = error_data.get("error", {}).get("status", "unknown")
            
            # 🔍 ENHANCED LOGGING: Log detailed error information
            self.logger.error(f"🔍 GOOGLE API ERROR: status={response.status_code}, code={error_code}, status={error_status}, message={error_message}")
            self.logger.error(f"🔍 Full error response: {error_data}")
            
        except:
            error_message = f"HTTP {response.status_code}: {response.text}"
            error_code = "http_error"
            error_status = "unknown"
            
            # Log raw response for debugging
            self.logger.error(f"🔍 RAW GOOGLE API ERROR: {response.status_code} - {response.text}")
        
        # Map Google error codes to our exceptions with detailed messages
        if response.status_code == 401 or response.status_code == 403:
            detailed_message = f"Invalid API key or insufficient permissions. Please check your Google AI Studio API key. Error: {error_message}"
            raise LLMConfigurationError(detailed_message)
        elif response.status_code == 429:
            detailed_message = f"Google AI Studio rate limit exceeded. Free tier has very low limits (15 RPM). Consider upgrading to paid tier or wait before retrying. Error: {error_message}"
            raise LLMQuotaExceededError(detailed_message)
        elif response.status_code == 400:
            detailed_message = f"Bad request to Google API. Check model name and parameters. Error: {error_message}"
            raise LLMProviderError(detailed_message, self.provider_name, response.status_code)
        else:
            detailed_message = f"Google API error (status: {response.status_code}, code: {error_code}): {error_message}"
            raise LLMProviderError(
                detailed_message,
                provider=self.provider_name,
                status_code=response.status_code,
                error_details={"error_code": error_code, "error_status": error_status}
            )
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test Google Gemini API connection."""
        try:
            # Create a simple test request
            test_request = ChatRequest(
                messages=[ChatMessage("user", "Hello! This is a test.")],
                max_tokens=10
            )
            
            start_time = time.time()
            response = await self.send_chat_request(test_request)
            response_time = int((time.time() - start_time) * 1000)
            
            return {
                "success": True,
                "message": "Connection successful",
                "response_time_ms": response_time,
                "model": response.model,
                "cost": response.cost
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection failed: {str(e)}",
                "error_type": type(e).__name__
            }
    
    def estimate_cost(self, request: ChatRequest) -> Optional[float]:
        """Estimate cost for Google Gemini request."""
        if not self.config.has_cost_tracking:
            return None
        
        # Rough estimation: count characters and estimate tokens
        # 1 token ≈ 4 characters for English text
        total_chars = sum(len(msg.content) for msg in request.messages)
        estimated_input_tokens = total_chars // 4
        
        # Estimate output tokens (conservative guess)
        max_tokens = request.max_tokens or self.config.model_parameters.get("max_tokens", 1000)
        estimated_output_tokens = min(max_tokens, estimated_input_tokens // 2)
        
        return self.config.calculate_request_cost(estimated_input_tokens, estimated_output_tokens)
    
    async def get_available_models(self) -> list[str]:
        """
        Fetch available models from Google Gemini API.
        
        Returns:
            List of model IDs available from Google
            
        Raises:
            LLMProviderError: If API call fails
            LLMConfigurationError: If configuration is invalid
        """
        self._validate_configuration()
        
        async with self._get_http_client() as client:
            try:
                self.logger.info("Fetching available models from Google Gemini API")
                
                # Google API endpoint for listing models
                api_key = self.config.get_decrypted_api_key()
                url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                
                response = await client.get(url)
                
                if response.status_code == 200:
                    data = response.json()
                    models = []
                    
                    # Extract model names from the response
                    for model in data.get("models", []):
                        model_name = model.get("name", "")
                        # Extract model ID from name (e.g., "models/gemini-1.5-pro" -> "gemini-1.5-pro")
                        if model_name.startswith("models/"):
                            model_id = model_name.replace("models/", "")
                            # Only include generative models (exclude embeddings, etc.)
                            if "generateContent" in model.get("supportedGenerationMethods", []):
                                models.append(model_id)
                    
                    self.logger.info(f"Fetched {len(models)} models from Google Gemini API")
                    return models
                else:
                    await self._handle_error_response(response)
                    
            except httpx.TimeoutException:
                raise LLMProviderError(
                    "Request timed out while fetching models",
                    provider=self.provider_name,
                    error_details={"timeout": True}
                )
            except httpx.RequestError as e:
                raise LLMProviderError(
                    f"Network error while fetching models: {str(e)}",
                    provider=self.provider_name,
                    error_details={"network_error": str(e)}
                )
    
    def _get_http_client(self) -> httpx.AsyncClient:
        """
        Create and configure an asynchronous HTTP client for Google API requests.
        
        Google uses API key in URL params rather than headers for authentication.
        
        Returns:
            An httpx.AsyncClient instance ready for use.
        """
        headers = {
            "Content-Type": "application/json",
        }
        
        if self.config.custom_headers:
            headers.update(self.config.custom_headers)
            
        return httpx.AsyncClient(
            headers=headers,
            timeout=60.0,  # Generous timeout for slow models
        )
    
    def _estimate_usage_from_content(self, content: str, payload: Dict[str, Any]) -> Dict[str, int]:
        """
        Estimate token usage from accumulated content during streaming.
        
        Args:
            content: The accumulated response content
            payload: The original request payload
            
        Returns:
            Dictionary with estimated token counts
        """
        # Estimate input tokens from original messages
        input_chars = 0
        for msg_content in payload.get("contents", []):
            for part in msg_content.get("parts", []):
                input_chars += len(str(part.get("text", "")))
        
        estimated_input_tokens = max(1, input_chars // 4)  # ~4 chars per token
        
        # Estimate output tokens from response content
        estimated_output_tokens = max(1, len(content) // 4)
        
        return {
            "input_tokens": estimated_input_tokens,
            "output_tokens": estimated_output_tokens,
            "total_tokens": estimated_input_tokens + estimated_output_tokens
        }
    
    async def stream_chat_request(self, request: ChatRequest):
        """
        Stream responses from Google Gemini using their native streaming API.
        
        Google Gemini supports streaming via the streamGenerateContent endpoint.
        
        Yields:
            Dict[str, Any]: Streaming chunks with Google content
        """
        self._validate_configuration()
        
        # Get model name
        model = request.model or self.config.default_model
        
        # Convert messages to Gemini format (same as non-streaming)
        contents = []
        for msg in request.messages:
            role = "model" if msg.role == "assistant" else "user"
            contents.append({
                "parts": [{"text": msg.content}],
                "role": role
            })
        
        # Build streaming request payload
        payload = {
            "contents": contents
        }
        
        # Add generation config
        generation_config = {}
        
        if request.temperature is not None:
            generation_config["temperature"] = request.temperature
        elif self.config.model_parameters and "temperature" in self.config.model_parameters:
            generation_config["temperature"] = self.config.model_parameters["temperature"]
        
        if request.max_tokens is not None:
            generation_config["maxOutputTokens"] = request.max_tokens
        elif self.config.model_parameters and "max_tokens" in self.config.model_parameters:
            generation_config["maxOutputTokens"] = self.config.model_parameters["max_tokens"]
        
        if generation_config:
            payload["generationConfig"] = generation_config
        
        payload.update(request.extra_params)
        
        start_time = time.time()
        
        async with self._get_http_client() as client:
            try:
                # Google streaming API endpoint
                api_key = self.config.get_decrypted_api_key()
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={api_key}"
                
                # Enhanced logging for streaming
                safe_url = url.replace(api_key, "[API_KEY_HIDDEN]")
                self.logger.info(f"🌊 Starting Google streaming request to: {safe_url}")
                self.logger.info(f"🌊 Streaming payload: {len(str(payload))} chars")
                
                # Make streaming request
                async with client.stream(
                    "POST",
                    url,
                    json=payload
                ) as response:
                    
                    if response.status_code != 200:
                        self.logger.error(f"🌊 Google streaming failed with status {response.status_code}")
                        await self._handle_error_response(response)
                    
                    # Process streaming response
                    accumulated_content = ""
                    
                    async for line in response.aiter_lines():
                        try:
                            # Google returns JSONL format for streaming
                            if line.strip():
                                chunk_data = json.loads(line)
                                
                                # Extract content from Google streaming chunk
                                candidates = chunk_data.get("candidates", [])
                                if candidates and candidates[0].get("content"):
                                    parts = candidates[0]["content"].get("parts", [])
                                    if parts:
                                        content = parts[0].get("text", "")
                                        
                                        if content:
                                            accumulated_content += content
                                            
                                            # Yield content chunk
                                            yield {
                                                "content": content,
                                                "is_final": False,
                                                "model": model,
                                                "provider": self.provider_name
                                            }
                                
                                # Check if this is the final chunk
                                if candidates and "finishReason" in candidates[0]:
                                    # Final chunk - calculate usage and cost
                                    response_time_ms = int((time.time() - start_time) * 1000)
                                    
                                    # Extract usage metadata if available
                                    usage_metadata = chunk_data.get("usageMetadata", {})
                                    if usage_metadata:
                                        final_usage = {
                                            "input_tokens": usage_metadata.get("promptTokenCount", 0),
                                            "output_tokens": usage_metadata.get("candidatesTokenCount", 0),
                                            "total_tokens": usage_metadata.get("totalTokenCount", 0)
                                        }
                                    else:
                                        # Estimate usage if not provided
                                        final_usage = self._estimate_usage_from_content(accumulated_content, payload)
                                    
                                    final_cost = self._calculate_actual_cost(final_usage)
                                    
                                    yield {
                                        "content": "",
                                        "is_final": True,
                                        "model": model,
                                        "provider": self.provider_name,
                                        "usage": final_usage,
                                        "cost": final_cost,
                                        "response_time_ms": response_time_ms
                                    }
                                    break
                                    
                        except json.JSONDecodeError:
                            # Skip malformed lines
                            continue
                        except Exception as e:
                            self.logger.error(f"🌊 Error processing streaming chunk: {str(e)}")
                            continue
                    
                    self.logger.info(f"🌊 Google streaming completed. Total content: {len(accumulated_content)} chars")
                    
            except httpx.TimeoutException:
                raise LLMProviderError(
                    "Google streaming request timed out",
                    provider=self.provider_name,
                    error_details={"timeout": True, "streaming": True}
                )
            except httpx.RequestError as e:
                raise LLMProviderError(
                    f"Google streaming network error: {str(e)}",
                    provider=self.provider_name,
                    error_details={"network_error": str(e), "streaming": True}
                )


# Export Google provider
__all__ = ['GoogleProvider']
