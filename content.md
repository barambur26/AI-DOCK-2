New chat
Today
Netlify Build Fails Due to TypeScript Errors
Get App

Netlify Build Fails Due to TypeScript Errors
4:39:29 PM: Netlify Build                                                 
4:39:29 PM: ────────────────────────────────────────────────────────────────
4:39:29 PM: ​
4:39:29 PM: ❯ Version
4:39:29 PM:   @netlify/build 34.0.0
4:39:29 PM: ​
4:39:29 PM: ❯ Flags
4:39:29 PM:   accountId: 686d5adc9e9d2e86c9eab605
4:39:29 PM:   baseRelDir: true
4:39:29 PM:   buildId: 686d9002336b0918060e035e
4:39:29 PM:   deployId: 686d9002336b0918060e0360
4:39:29 PM: ​
4:39:29 PM: ❯ Current directory
4:39:29 PM:   /opt/build/repo/Front
4:39:29 PM: ​
4:39:29 PM: ❯ Config file
4:39:29 PM:   No config file was defined: using default values.
4:39:29 PM: ​
4:39:29 PM: ❯ Context
4:39:29 PM:   production
4:39:29 PM: ​
4:39:29 PM: Build command from Netlify app                                
4:39:29 PM: ────────────────────────────────────────────────────────────────
4:39:29 PM: ​
4:39:29 PM: $ npm run build
4:39:29 PM: > ai-dock-frontend@1.0.0 build
4:39:29 PM: > tsc && vite build
4:39:36 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2
4:39:36 PM: src/App.tsx(1,1): error TS6133: 'React' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(6,3): error TS6133: 'Plus' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(7,3): error TS6133: 'Search' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(8,3): error TS6133: 'Edit3' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(9,3): error TS6133: 'Trash2' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(10,3): error TS6133: 'Building2' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(11,3): error TS6133: 'Users' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(12,3): error TS6133: 'DollarSign' is declared but its value is never read.
4:39:36 PM: src/components/admin/DepartmentManagement.tsx(13,3): error TS6133: 'BarChart3' is declared but its value is never read.
4:39:36 PM: src/components/admin/LLMConfiguration.tsx(54,10): error TS6133: 'showTestModal' is declared but its value is never read.
4:39:36 PM: src/components/admin/LLMConfiguration.tsx(54,25): error TS6133: 'setShowTestModal' is declared but its value is never read.
4:39:36 PM: src/components/admin/LLMConfiguration.tsx(79,9): error TS6133: 'providerOptions' is declared but its value is never read.
4:39:36 PM: src/components/admin/LLMConfiguration.tsx(698,9): error TS2322: Type '(simpleConfigData: LLMConfigurationSimpleCreate) => Promise<void>' is not assignable to type '(configData: LLMSimpleCreateData) => Promise<void>'.
4:39:36 PM:   Types of parameters 'simpleConfigData' and 'configData' are incompatible.
4:39:36 PM:     Type 'LLMSimpleCreateData' is not assignable to type 'LLMConfigurationSimpleCreate'.
4:39:36 PM:       Types of property 'provider' are incompatible.
4:39:36 PM:         Type 'string' is not assignable to type 'LLMProvider'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(57,5): error TS2322: Type 'null' is not assignable to type 'number | undefined'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(58,5): error TS2322: Type 'null' is not assignable to type 'number | undefined'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(61,5): error TS2322: Type 'null' is not assignable to type 'number | undefined'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(96,35): error TS2339: Property 'default_version' does not exist on type 'LLMProviderInfo'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(97,37): error TS2339: Property 'default_model' does not exist on type 'LLMProviderInfo'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(98,40): error TS2339: Property 'available_models' does not exist on type 'LLMProviderInfo'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(99,48): error TS2339: Property 'default_input_cost' does not exist on type 'LLMProviderInfo'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(100,49): error TS2339: Property 'default_output_cost' does not exist on type 'LLMProviderInfo'.
4:39:36 PM: src/components/admin/LLMCreateModal.tsx(104,44): error TS2339: Property 'available_models' does not exist on type 'LLMProviderInfo'.
4:39:36 PM: src/components/admin/LLMEditModal.tsx(15,3): error TS6133: 'LLMProvider' is declared but its value is never read.
4:39:36 PM: src/components/admin/LLMEditModal.tsx(62,10): error TS6133: 'selectedProviderInfo' is declared but its value is never read.
4:39:36 PM: src/components/admin/LLMEditModal.tsx(79,9): error TS2353: Object literal may only specify known properties, and 'provider' does not exist in type 'Partial<LLMConfigurationUpdate>'.
4:39:36 PM: src/components/admin/LLMEditModal.tsx(495,17): error TS2345: Argument of type '"provider"' is not assignable to parameter of type 'keyof LLMConfigurationUpdate'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(11,3): error TS6133: 'DepartmentOption' is declared but its value is never read.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(164,15): error TS2339: Property 'department_id' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'department_id' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(164,37): error TS2339: Property 'department_id' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'department_id' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(168,15): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(188,14): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(188,39): error TS18048: 'data.limit_value' is possibly 'undefined'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(192,14): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(192,41): error TS18048: 'data.limit_value' is possibly 'undefined'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(196,14): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(196,43): error TS18048: 'data.limit_value' is possibly 'undefined'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(224,55): error TS2345: Argument of type 'QuotaCreateRequest | QuotaUpdateRequest' is not assignable to parameter of type 'QuotaCreateRequest'.
4:39:36 PM:   Type 'QuotaUpdateRequest' is missing the following properties from type 'QuotaCreateRequest': department_id, quota_type
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(290,13): error TS2339: Property 'department_id' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(290,28): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(290,54): error TS2339: Property 'llm_config_id' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(311,91): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(312,50): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(460,43): error TS2339: Property 'department_id' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'department_id' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(507,39): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(564,40): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(570,37): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(571,37): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(572,37): error TS2339: Property 'quota_type' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'quota_type' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(575,18): error TS18048: 'formState.data.limit_value' is possibly 'undefined'.
4:39:36 PM: src/components/admin/QuotaCreateModal.tsx(647,41): error TS2339: Property 'llm_config_id' does not exist on type 'QuotaCreateRequest | QuotaUpdateRequest'.
4:39:36 PM:   Property 'llm_config_id' does not exist on type 'QuotaUpdateRequest'.
4:39:36 PM: src/components/admin/QuotaEditModal.tsx(11,3): error TS6133: 'DepartmentOption' is declared but its value is never read.
4:39:36 PM: src/components/admin/QuotaManagement.tsx(4,8): error TS6133: 'React' is declared but its value is never read.
4:39:36 PM: src/components/admin/QuotaManagement.tsx(313,50): error TS6133: 'match' is declared but its value is never read.
4:39:36 PM: src/components/admin/QuotaTable.tsx(4,8): error TS6133: 'React' is declared but its value is never read.
4:39:36 PM: src/components/admin/RecentActivity.tsx(6,30): error TS6133: 'UsageLogEntry' is declared but its value is never read.
4:39:36 PM: src/components/admin/RecentActivity.tsx(25,3): error TS6133: 'onFilterChange' is declared but its value is never read.
4:39:36 PM: src/components/admin/RecentActivity.tsx(139,9): error TS6133: 'formatCost' is declared but its value is never read.
4:39:36 PM: src/components/admin/TopUsersTable.tsx(7,1): error TS6192: All imports in import declaration are unused.
4:39:36 PM: src/components/admin/UsageCharts.tsx(17,3): error TS6133: 'LineChart' is declared but its value is never read.
4:39:36 PM: src/components/admin/UsageCharts.tsx(24,10): error TS6133: 'ProviderStats' is declared but its value is never read.
4:39:36 PM: src/components/admin/UsageCharts.tsx(377,47): error TS6133: 'index' is declared but its value is never read.
4:39:36 PM: src/components/admin/UsageDashboard.tsx(7,10): error TS6133: 'DashboardData' is declared but its value is never read.
4:39:36 PM: src/components/admin/UsageDashboard.tsx(41,72): error TS2345: Argument of type '{ isLoading: true; isRefreshing: false; error: null; data: null; lastUpdated: null; selectedPeriod: number; selectedMetric: "total_cost"; }' is not assignable to parameter of type 'DashboardState | (() => DashboardState)'.
4:39:36 PM:   Property 'selectedProvider' is missing in type '{ isLoading: true; isRefreshing: false; error: null; data: null; lastUpdated: null; selectedPeriod: number; selectedMetric: "total_cost"; }' but required in type 'DashboardState'.
4:39:36 PM: src/components/admin/UsageDashboard.tsx(272,9): error TS6133: 'handleMetricChange' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserCreateModal.tsx(6,19): error TS6133: 'Mail' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserCreateModal.tsx(6,25): error TS6133: 'Lock' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserCreateModal.tsx(453,9): error TS6133: 'renderSelectField' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserCreateModal.tsx(469,11): error TS2322: Type 'string | number | true | { phone?: string | undefined; timezone?: string | undefined; language_preference?: string | undefined; }' is not assignable to type 'string | number | readonly string[] | undefined'.
4:39:36 PM:   Type 'true' is not assignable to type 'string | number | readonly string[] | undefined'.
4:39:36 PM: src/components/admin/UserEditModal.tsx(6,19): error TS6133: 'Mail' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserEditModal.tsx(6,25): error TS6133: 'Eye' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserEditModal.tsx(6,30): error TS6133: 'EyeOff' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserEditModal.tsx(6,64): error TS6133: 'Loader2' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserEditModal.tsx(54,10): error TS6133: 'isLoading' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserManagement.tsx(7,59): error TS6133: 'useMemo' is declared but its value is never read.
4:39:36 PM: src/components/admin/UserManagement.tsx(15,3): error TS6133: 'MoreHorizontal' is declared but its value is never read.
4:39:36 PM: src/components/admin/components/DepartmentModals.tsx(86,9): error TS2322: Type '(data: DepartmentCreate) => Promise<void>' is not assignable to type '(data: DepartmentCreate | DepartmentUpdate) => Promise<void>'.
4:39:36 PM:   Types of parameters 'data' and 'data' are incompatible.
4:39:36 PM:     Type 'DepartmentCreate | DepartmentUpdate' is not assignable to type 'DepartmentCreate'.
4:39:36 PM:       Type 'DepartmentUpdate' is not assignable to type 'DepartmentCreate'.
4:39:36 PM:         Types of property 'name' are incompatible.
4:39:36 PM:           Type 'string | undefined' is not assignable to type 'string'.
4:39:36 PM:             Type 'undefined' is not assignable to type 'string'.
4:39:36 PM: src/components/admin/components/DepartmentStatsCards.tsx(46,34): error TS2339: Property 'formatBudget' does not exist on type 'DepartmentService'.
4:39:36 PM: src/components/admin/components/DepartmentStatsCards.tsx(55,32): error TS2339: Property 'formatBudget' does not exist on type 'DepartmentService'.
4:39:36 PM: src/components/admin/components/DepartmentStatsCards.tsx(66,34): error TS2339: Property 'formatUtilization' does not exist on type 'DepartmentService'.
4:39:36 PM: src/components/admin/components/DepartmentStatsCards.tsx(76,64): error TS2339: Property 'getBudgetUtilizationColor' does not exist on type 'DepartmentService'.
4:39:36 PM: src/components/admin/user/UserSearch.tsx(274,15): error TS2484: Export declaration conflicts with exported declaration of 'UserSearchProps'.
4:39:36 PM: src/components/assistant/AssistantCard.tsx(14,3): error TS6133: 'Clock' is declared but its value is never read.
4:39:36 PM: src/components/assistant/CreateAssistantModal.tsx(6,18): error TS6133: 'Eye' is declared but its value is never read.
4:39:36 PM: src/components/assistant/CreateAssistantModal.tsx(6,23): error TS6133: 'EyeOff' is declared but its value is never read.
4:39:36 PM: src/components/assistant/CreateAssistantModal.tsx(16,3): error TS6133: 'DEFAULT_ASSISTANT_CONFIG' is declared but its value is never read.
4:39:36 PM: src/components/assistant/CreateAssistantModal.tsx(475,19): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ model?: string | undefined; temperature?: number | undefined; max_tokens?: number | undefined; top_p?: number | undefined; frequency_penalty?: number | undefined; presence_penalty?: number | undefined; }'.
  No index signature with a parameter of type 'string' was found on type '{ model?: string | undefined; temperature?: number | undefined; max_tokens?: number | undefined; top_p?: number | undefined; frequency_penalty?: number | undefined; presence_penalty?: number | undefined; }'.
4:39:36 PM: src/components/assistant/EditAssistantModal.tsx(72,5): error TS6133: 'setShowFileManagement' is declared but its value is never read.
4:39:36 PM: src/components/assistant/EditAssistantModal.tsx(85,5): error TS6133: 'canSubmit' is declared but its value is never read.
4:39:36 PM: src/components/assistant/edit-modal/FileManagementSection.tsx(22,3): error TS6133: 'AssistantFilesResponse' is declared but its value is never read.
4:39:36 PM: src/components/assistant/edit-modal/FileManagementSection.tsx(25,3): error TS6133: 'AssistantFileOperationResponse' is declared but its value is never read.
4:39:36 PM: src/components/assistant/edit-modal/FormField.tsx(36,3): error TS6133: 'name' is declared but its value is never read.
4:39:36 PM: src/components/assistant/edit-modal/useEditAssistantForm.ts(255,26): error TS6133: 'fieldName' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantFilesIndicator.tsx(6,34): error TS2307: Cannot find module '../../../types/assistant' or its corresponding type declarations.
4:39:36 PM: src/components/chat/AssistantFilesIndicator.tsx(7,35): error TS2307: Cannot find module '../../../types/assistant-file' or its corresponding type declarations.
4:39:36 PM: src/components/chat/AssistantInfoTooltip.tsx(15,3): error TS6133: 'Clock' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantInfoTooltip.tsx(16,3): error TS6133: 'User' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantQuickSwitcher.tsx(6,36): error TS6133: 'Sparkles' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantQuickSwitcher.tsx(6,61): error TS6133: 'Clock' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantQuickSwitcher.tsx(6,68): error TS6133: 'ChevronDown' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantSelectorCard.tsx(6,25): error TS6133: 'Sparkles' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantSelectorCard.tsx(37,48): error TS2503: Cannot find namespace 'NodeJS'.
4:39:36 PM: src/components/chat/AssistantSuggestions.tsx(9,22): error TS6133: 'Star' is declared but its value is never read.
4:39:36 PM: src/components/chat/AssistantSuggestions.tsx(254,51): error TS2551: Property 'department_name' does not exist on type 'User'. Did you mean 'department'?
4:39:36 PM: src/components/chat/AssistantSuggestions.tsx(255,26): error TS2551: Property 'department_name' does not exist on type 'User'. Did you mean 'department'?
4:39:36 PM: src/components/chat/AssistantSuggestions.tsx(332,49): error TS6133: 'index' is declared but its value is never read.
4:39:36 PM: src/components/chat/ConversationSidebar.tsx(11,3): error TS6133: 'Calendar' is declared but its value is never read.
4:39:36 PM: src/components/chat/ConversationSidebar.tsx(14,3): error TS6133: 'ChevronRight' is declared but its value is never read.
4:39:36 PM: src/components/chat/ConversationSidebar.tsx(16,3): error TS6133: 'Archive' is declared but its value is never read.
4:39:36 PM: src/components/chat/ConversationSidebar.tsx(95,9): error TS6133: 'updateConversationMessageCount' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileAttachment.tsx(18,3): error TS6133: 'FileUpload' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileAttachment.tsx(19,3): error TS6133: 'FileError' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileAttachment.tsx(28,3): error TS6133: 'formatWordMetadata' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileAttachment.tsx(96,40): error TS2345: Argument of type 'FileMetadata | {}' is not assignable to parameter of type 'FileMetadata'.
4:39:36 PM:   Type '{}' is missing the following properties from type 'FileMetadata': name, size, type, lastModified, isValid
4:39:36 PM: src/components/chat/FileUpload.tsx(5,48): error TS6133: 'useEffect' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(9,3): error TS6133: 'File' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(13,3): error TS6133: 'FolderOpen' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(15,3): error TS6133: 'HardDrive' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(24,3): error TS6133: 'FileValidationResult' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(25,3): error TS6133: 'FileUploadStatus' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(27,3): error TS6133: 'validateFile' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(32,3): error TS6133: 'isSupportedFileType' is declared but its value is never read.
4:39:36 PM: src/components/chat/FileUpload.tsx(33,3): error TS6133: 'isValidFileSize' is declared but its value is never read.
4:39:36 PM: src/components/chat/MessageInput.tsx(7,39): error TS6133: 'Upload' is declared but its value is never read.
4:39:36 PM: src/components/chat/MessageInput.tsx(14,3): error TS6133: 'createFileUpload' is declared but its value is never read.
4:39:36 PM: src/components/chat/MessageInput.tsx(315,9): error TS6133: 'handleAttachmentRemoved' is declared but its value is never read.
4:39:36 PM: src/components/chat/MessageInput.tsx(435,11): error TS2322: Type 'void' is not assignable to type 'ReactNode'.
4:39:36 PM: src/components/chat/MessageList.tsx(7,28): error TS6133: 'useRef' is declared but its value is never read.
4:39:36 PM: src/components/chat/MessageList.tsx(372,5): error TS6133: 'setAutoScrollEnabled' is declared but its value is never read.
4:39:36 PM: src/components/chat/ProjectManager.tsx(8,52): error TS6133: 'Archive' is declared but its value is never read.
4:39:36 PM: src/components/chat/ProjectManager.tsx(8,82): error TS6133: 'Calendar' is declared but its value is never read.
4:39:36 PM: src/components/chat/conversation/ConversationItem.tsx(224,14): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
4:39:36 PM: src/components/chat/conversation/ConversationList.tsx(9,3): error TS6133: 'Calendar' is declared but its value is never read.
4:39:36 PM: src/components/chat/conversation/SaveConversationModal.tsx(14,3): error TS6133: 'Settings' is declared but its value is never read.
4:39:36 PM: src/components/chat/conversation/SaveConversationModal.tsx(37,3): error TS6133: 'isLoading' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(15,3): error TS6133: 'Settings' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(17,3): error TS6133: 'Star' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(18,3): error TS6133: 'Archive' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(20,3): error TS6133: 'Calendar' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(24,3): error TS6133: 'User' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(25,3): error TS6133: 'Zap' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/AssistantSidebar.tsx(50,3): error TS6133: 'onCreateNew' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(24,1): error TS6192: All imports in import declaration are unused.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(29,9): error TS6133: 'user' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(41,17): error TS6133: 'toggleSidebarMode' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(49,5): error TS6133: 'folderForNewChatData' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(53,5): error TS6133: 'getNewChatFolderDefaultAssistantId' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(68,5): error TS6133: 'selectedConfig' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(70,15): error TS6133: 'setModelError' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(78,5): error TS6133: 'assistantsLoading' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(79,5): error TS6133: 'assistantsError' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(80,5): error TS6133: 'showAssistantManager' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(82,5): error TS6133: 'handleAssistantChange' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(84,5): error TS6133: 'setShowAssistantManager' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(100,5): error TS6133: 'lastAutoSaveMessageCount' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(103,5): error TS6133: 'sidebarUpdateFunction' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(104,5): error TS6133: 'sidebarAddConversationFunction' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(111,5): error TS6133: 'handleAddConversationToSidebar' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(128,62): error TS2304: Cannot find name 'ChatMessage'.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(256,10): error TS6133: 'isLoadingConversation' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatContainer.tsx(395,56): error TS2345: Argument of type '{ id: number; name: string; description: string | undefined; system_prompt_preview: string; is_active: boolean; conversation_count: number; created_at: string; is_new: boolean; }' is not assignable to parameter of type 'AssistantSummary'.
4:39:36 PM:   Type '{ id: number; name: string; description: string | undefined; system_prompt_preview: string; is_active: boolean; conversation_count: number; created_at: string; is_new: boolean; }' is missing the following properties from type 'AssistantSummary': color, file_count, has_files
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(7,3): error TS6133: 'Settings' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(9,3): error TS6133: 'AlertCircle' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(10,3): error TS6133: 'CheckCircle' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(12,3): error TS6133: 'Home' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(16,3): error TS6133: 'Folder' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(72,3): error TS6133: 'selectedProject' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ChatHeader.tsx(88,9): error TS6133: 'handleBackToDashboard' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/EditProjectFolderModal.tsx(6,13): error TS6133: 'Folder' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/EditProjectFolderModal.tsx(6,52): error TS6133: 'Star' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/EditProjectModal.tsx(51,35): error TS2339: Property 'system_prompt' does not exist on type 'ProjectDetails'.
4:39:36 PM: src/components/chat/ui/EditProjectModal.tsx(52,39): error TS2339: Property 'model_preferences' does not exist on type 'ProjectDetails'.
4:39:36 PM: src/components/chat/ui/ModelSelector.tsx(28,3): error TS6133: 'isMobile' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ModelSelector.tsx(107,9): error TS6133: 'getCostTierDisplay' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ModelSelector.tsx(107,31): error TS6133: 'costTier' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ModelSelector.tsx(112,9): error TS6133: 'costDisplay' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ProjectFoldersSidebar.tsx(21,26): error TS6133: 'ProjectCreateRequest' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ProjectFoldersSidebar.tsx(21,48): error TS6133: 'ProjectUpdateRequest' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/ProjectFoldersSidebar.tsx(525,29): error TS6133: 'folderId' is declared but its value is never read.
4:39:36 PM: src/components/chat/ui/StatusIndicators.tsx(15,3): error TS6133: 'isMobile' is declared but its value is never read.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(10,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(47,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(48,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(65,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(66,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(69,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(86,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(87,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(91,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(92,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(109,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(110,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(114,3): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(115,5): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(127,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(128,7): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(137,1): error TS2582: Cannot find name 'describe'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(139,37): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(140,35): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(169,3): error TS2304: Cannot find name 'beforeEach'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(170,5): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(173,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(183,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(184,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(187,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(197,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(198,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(201,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(211,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(212,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(215,3): error TS2582: Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(225,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/__tests__/conversationLoadingAssistantSelection.test.ts(226,5): error TS2304: Cannot find name 'expect'.
4:39:36 PM: src/hooks/chat/useAssistantManager.ts(40,3): error TS6133: 'onAssistantMessage' is declared but its value is never read.
4:39:36 PM: src/hooks/chat/useChatState.ts(6,1): error TS6133: 'useSearchParams' is declared but its value is never read.
4:39:36 PM: src/hooks/chat/useChatState.ts(125,35): error TS2339: Property 'system_prompt' does not exist on type 'ProjectDetails'.
4:39:36 PM: src/hooks/chat/useChatState.ts(128,43): error TS2339: Property 'system_prompt' does not exist on type 'ProjectDetails'.
4:39:36 PM: src/hooks/chat/useConversationManager.ts(5,20): error TS6133: 'useEffect' is declared but its value is never read.
4:39:36 PM: src/hooks/chat/useConversationManager.ts(8,36): error TS6133: 'DEFAULT_AUTO_SAVE_CONFIG' is declared but its value is never read.
4:39:36 PM: src/hooks/chat/useConversationManager.ts(106,9): error TS2345: Argument of type '{ projectId: number | null | undefined; selectedConfigId?: number; selectedModelId?: string; }' is not assignable to parameter of type '{ selectedConfigId?: number | undefined; selectedModelId?: string | undefined; projectId?: number | undefined; }'.
4:39:36 PM:   Types of property 'projectId' are incompatible.
4:39:36 PM:     Type 'number | null | undefined' is not assignable to type 'number | undefined'.
4:39:36 PM:       Type 'null' is not assignable to type 'number | undefined'.
4:39:36 PM: src/hooks/chat/useConversationManager.ts(208,9): error TS2345: Argument of type '{ projectId: number | null | undefined; selectedConfigId?: number; selectedModelId?: string; }' is not assignable to parameter of type '{ selectedConfigId?: number | undefined; selectedModelId?: string | undefined; projectId?: number | undefined; }'.
4:39:36 PM:   Types of property 'projectId' are incompatible.
4:39:36 PM:     Type 'number | null | undefined' is not assignable to type 'number | undefined'.
4:39:36 PM:       Type 'null' is not assignable to type 'number | undefined'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(6,28): error TS2305: Module '"./index"' has no exported member 'getProjectDefaultAssistantById'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(11,11): error TS2339: Property 'getProjectDefaultAssistantById' does not exist on type '{ setViewingFolder: (folderId: number | null, folderData?: ProjectSummary | null) => void; isViewingFolder: (folderId: number) => boolean; setFolderForNewChat: (folderId: number | null, folderData?: ProjectSummary | null) => void; ... 7 more ...; folderForNewChatData: ProjectSummary | null; }'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(46,47): error TS2339: Property 'getProjectSummary' does not exist on type 'ProjectServiceClass'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(64,5): error TS2339: Property 'getProjectDefaultAssistantById' does not exist on type '{ setViewingFolder: (folderId: number | null, folderData?: ProjectSummary | null) => void; isViewingFolder: (folderId: number) => boolean; setFolderForNewChat: (folderId: number | null, folderData?: ProjectSummary | null) => void; ... 7 more ...; folderForNewChatData: ProjectSummary | null; }'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(65,5): error TS2339: Property 'getNewChatFolderDefaultAssistant' does not exist on type '{ setViewingFolder: (folderId: number | null, folderData?: ProjectSummary | null) => void; isViewingFolder: (folderId: number) => boolean; setFolderForNewChat: (folderId: number | null, folderData?: ProjectSummary | null) => void; ... 7 more ...; folderForNewChatData: ProjectSummary | null; }'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(66,5): error TS2339: Property 'getViewingFolderDefaultAssistant' does not exist on type '{ setViewingFolder: (folderId: number | null, folderData?: ProjectSummary | null) => void; isViewingFolder: (folderId: number) => boolean; setFolderForNewChat: (folderId: number | null, folderData?: ProjectSummary | null) => void; ... 7 more ...; folderForNewChatData: ProjectSummary | null; }'.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(66,5): error TS6133: 'getViewingFolderDefaultAssistant' is declared but its value is never read.
4:39:36 PM: src/hooks/folder/USAGE_EXAMPLE.ts(83,59): error TS6133: 'conversationId' is declared but its value is never read.
4:39:36 PM: src/hooks/useAutoScroll.ts(88,35): error TS2503: Cannot find namespace 'NodeJS'.
4:39:36 PM: src/hooks/useAutoScroll.ts(89,39): error TS2503: Cannot find namespace 'NodeJS'.
4:39:36 PM: src/pages/AdminSettings.tsx(9,1): error TS6133: 'Home' is declared but its value is never read.
4:39:36 PM: src/pages/AdminSettings.tsx(171,9): error TS6133: 'handleBackToDashboard' is declared but its value is never read.
4:39:36 PM: src/pages/Dashboard.tsx(3,48): error TS6133: 'LogOut' is declared but its value is never read.
4:39:36 PM: src/pages/Dashboard.tsx(18,10): error TS6133: 'isLoadingUser' is declared but its value is never read.
4:39:36 PM: src/pages/Dashboard.tsx(37,9): error TS6133: 'handleLogout' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(19,3): error TS6133: 'ArrowLeft' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(20,3): error TS6133: 'Home' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(23,41): error TS2306: File '/opt/build/repo/Front/src/types/manager.ts' is not a module.
4:39:36 PM: src/pages/ManagerDashboard.tsx(32,60): error TS6133: 'className' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(47,10): error TS6133: 'refreshing' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(88,9): error TS6133: 'handleRefresh' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(92,9): error TS6133: 'handleBackToDashboard' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(96,9): error TS6133: 'handleLogout' is declared but its value is never read.
4:39:36 PM: src/pages/ManagerDashboard.tsx(329,45): error TS7006: Parameter 'role' implicitly has an 'any' type.
4:39:36 PM: src/pages/ManagerDashboard.tsx(329,51): error TS7006: Parameter 'index' implicitly has an 'any' type.
4:39:36 PM: src/pages/ManagerDashboard.tsx(446,50): error TS7006: Parameter 'activity' implicitly has an 'any' type.
4:39:36 PM: src/pages/UserSettings.tsx(3,10): error TS6133: 'ArrowLeft' is declared but its value is never read.
4:39:36 PM: src/pages/UserSettings.tsx(3,27): error TS6133: 'Mail' is declared but its value is never read.
4:39:36 PM: src/pages/UserSettings.tsx(13,11): error TS6133: 'logout' is declared but its value is never read.
4:39:36 PM: src/pages/UserSettings.tsx(77,9): error TS6133: 'handleBackToDashboard' is declared but its value is never read.
4:39:36 PM: src/services/adminService.ts(15,3): error TS6133: 'ApiResponse' is declared but its value is never read.
4:39:36 PM: src/services/adminService.ts(17,3): error TS6133: 'ErrorResponse' is declared but its value is never read.
4:39:36 PM: src/services/assistant/core/assistantErrorHandler.ts(61,5): error TS6133: 'context' is declared but its value is never read.
4:39:36 PM: src/services/assistant/core/assistantErrorHandler.ts(100,23): error TS2339: Property 'status' does not exist on type 'AssistantServiceError'.
4:39:36 PM: src/services/assistant/features/assistantListService.ts(142,9): error TS2322: Type 'string' is not assignable to type '"active" | "inactive" | "draft" | undefined'.
4:39:36 PM: src/services/assistant/features/assistantUtilityService.ts(201,13): error TS6133: 'assistant' is declared but its value is never read.
4:39:36 PM: src/services/assistantFileService.ts(15,34): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
4:39:36 PM: src/services/assistantFileService.ts(180,5): error TS6133: 'onProgress' is declared but its value is never read.
4:39:36 PM: src/services/assistantFileService.ts(298,11): error TS6133: 'formatFileSize' is declared but its value is never read.
4:39:36 PM: src/services/chat/chatService.ts(12,3): error TS6133: 'ConfigTestRequest' is declared but its value is never read.
4:39:36 PM: src/services/chat/chatService.ts(27,51): error TS6133: 'UnifiedModelInfo' is declared but its value is never read.
4:39:36 PM: src/services/chat/models.ts(9,3): error TS6133: 'UnifiedModelInfo' is declared but its value is never read.
4:39:36 PM: src/services/chat/streaming.ts(12,10): error TS6133: 'createChatServiceError' is declared but its value is never read.
4:39:36 PM: src/services/conversationService.ts(17,3): error TS6133: 'ConversationMessageCreate' is declared but its value is never read.
4:39:36 PM: src/services/conversationService.ts(20,3): error TS6133: 'shouldAutoSave' is declared but its value is never read.
4:39:36 PM: src/services/conversationService.ts(391,5): error TS6133: 'model' is declared but its value is never read.
4:39:36 PM: src/services/conversationUpdateService.ts(4,10): error TS6133: 'ConversationDetail' is declared but its value is never read.
4:39:36 PM: src/services/conversationUpdateService.ts(64,11): error TS6133: 'operationKey' is declared but its value is never read.
4:39:36 PM: src/services/fileService.ts(11,3): error TS6133: 'FileUploadStatus' is declared but its value is never read.
4:39:36 PM: src/services/fileService.ts(15,3): error TS6133: 'generateFileId' is declared but its value is never read.
4:39:36 PM: src/services/fileService.ts(16,3): error TS6133: 'createFileUpload' is declared but its value is never read.
4:39:36 PM: src/services/fileService.ts(17,3): error TS6133: 'MAX_FILE_SIZE' is declared but its value is never read.
4:39:36 PM: src/services/fileService.ts(19,3): error TS6133: 'CHUNK_TIMEOUT' is declared but its value is never read.
4:39:36 PM: src/services/fileService.ts(73,11): error TS6196: 'FileUploadRequest' is declared but never used.
4:39:36 PM: src/services/llmConfigService.ts(145,11): error TS6196: 'ApiResponse' is declared but never used.
4:39:36 PM: src/services/llmConfigService.ts(150,11): error TS6196: 'ApiError' is declared but never used.
4:39:36 PM: src/services/llmConfigService.ts(193,31): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
4:39:36 PM: src/services/llmConfigService.ts(266,51): error TS18046: 'error' is of type 'unknown'.
4:39:36 PM: src/services/llmConfigService.ts(666,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationSummary'.
4:39:36 PM: src/services/llmConfigService.ts(667,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationResponse'.
4:39:36 PM: src/services/llmConfigService.ts(668,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationCreate'.
4:39:36 PM: src/services/llmConfigService.ts(669,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationSimpleCreate'.
4:39:36 PM: src/services/llmConfigService.ts(670,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationUpdate'.
4:39:36 PM: src/services/llmConfigService.ts(671,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationTest'.
4:39:36 PM: src/services/llmConfigService.ts(672,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigurationTestResult'.
4:39:36 PM: src/services/llmConfigService.ts(673,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMProviderInfo'.
4:39:36 PM: src/services/llmConfigService.ts(674,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMProvider'.
4:39:36 PM: src/services/managerService.ts(11,3): error TS6133: 'ManagerQuotaCreateRequest' is declared but its value is never read.
4:39:36 PM: src/services/managerService.ts(12,3): error TS6133: 'ManagerQuotaUpdateRequest' is declared but its value is never read.
4:39:36 PM: src/services/managerService.ts(15,3): error TS6133: 'QuotaResetResponse' is declared but its value is never read.
4:39:36 PM: src/services/managerService.ts(17,3): error TS6133: 'ManagerApiResponse' is declared but its value is never read.
4:39:36 PM: src/services/managerService.ts(18,8): error TS2306: File '/opt/build/repo/Front/src/types/manager.ts' is not a module.
4:39:36 PM: src/services/managerService.ts(19,10): error TS2724: '"../types/admin"' has no exported member named 'UserResponse'. Did you mean 'UserListResponse'?
4:39:36 PM: src/services/managerService.ts(20,1): error TS6133: 'QuotaResponse' is declared but its value is never read.
4:39:36 PM: src/services/managerService.ts(23,34): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
4:39:36 PM: src/services/projectService.ts(28,18): error TS2395: Individual declarations in merged declaration 'ProjectServiceError' must be all exported or all local.
4:39:36 PM: src/services/projectService.ts(38,34): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
4:39:36 PM: src/services/projectService.ts(139,56): error TS18046: 'error' is of type 'unknown'.
4:39:36 PM: src/services/projectService.ts(144,7): error TS2395: Individual declarations in merged declaration 'ProjectServiceError' must be all exported or all local.
4:39:36 PM: src/services/quota/quotaOperations.ts(241,41): error TS2551: Property 'bulkDeleteQuotas' does not exist on type 'QuotaService'. Did you mean 'bulkResetQuotas'?
4:39:36 PM: src/services/quota/quotaOperations.ts(275,5): error TS6133: 'quotas' is declared but its value is never read.
4:39:36 PM: src/services/quota/quotaOperations.ts(297,41): error TS2551: Property 'bulkUpdateQuotas' does not exist on type 'QuotaService'. Did you mean 'updateQuota'?
4:39:36 PM: src/services/quotaService.ts(18,3): error TS6133: 'QuotaType' is declared but its value is never read.
4:39:36 PM: src/services/quotaService.ts(19,3): error TS6133: 'QuotaPeriod' is declared but its value is never read.
4:39:36 PM: src/services/quotaService.ts(28,34): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
4:39:36 PM: src/services/quotaService.ts(141,50): error TS18046: 'error' is of type 'unknown'.
4:39:36 PM: src/services/roleService.ts(271,15): error TS6133: 'role' is declared but its value is never read.
4:39:36 PM: src/test/__mocks__/assistantService.ts(2,24): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/assistantService.ts(3,17): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/assistantService.ts(4,20): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/assistantService.ts(5,20): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/assistantService.ts(6,20): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationService.ts(2,27): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationService.ts(3,20): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationService.ts(4,21): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationService.ts(5,23): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationService.ts(6,23): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationService.ts(7,21): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationUpdateService.ts(2,26): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationUpdateService.ts(3,22): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationUpdateService.ts(4,32): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/conversationUpdateService.ts(5,27): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/projectService.ts(2,16): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/projectService.ts(3,15): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/projectService.ts(4,22): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/projectService.ts(5,18): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/projectService.ts(6,18): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/__mocks__/projectService.ts(7,18): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/setupTests.ts(4,22): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/setupTests.ts(6,29): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/setupTests.ts(8,1): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/setupTests.ts(9,6): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/test/setupTests.ts(15,1): error TS2304: Cannot find name 'beforeEach'.
4:39:36 PM: src/test/setupTests.ts(16,3): error TS2304: Cannot find name 'jest'.
4:39:36 PM: src/types/assistant.ts(6,1): error TS6133: 'ConversationSummary' is declared but its value is never read.
4:39:36 PM: src/types/assistant.ts(525,3): error TS2739: Type '{ id: number; name: string; description: string | undefined; system_prompt_preview: string; is_active: boolean; conversation_count: number; created_at: string; is_new: boolean; color: string; }' is missing the following properties from type 'AssistantSummary': file_count, has_files
4:39:36 PM: src/types/file/index.ts(8,1): error TS2308: Module './core' has already exported a member named 'PDFMetadata'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(8,1): error TS2308: Module './core' has already exported a member named 'PDFTOCEntry'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(8,1): error TS2308: Module './core' has already exported a member named 'PDFTextQuality'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(11,1): error TS2308: Module './core' has already exported a member named 'WordElementType'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(11,1): error TS2308: Module './core' has already exported a member named 'WordMetadata'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(11,1): error TS2308: Module './core' has already exported a member named 'WordStructureComplexity'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(11,1): error TS2308: Module './core' has already exported a member named 'WordStructureElement'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(11,1): error TS2308: Module './core' has already exported a member named 'WordStyleInfo'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/index.ts(11,1): error TS2308: Module './core' has already exported a member named 'WordTextQuality'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/file/utilities.ts(73,11): error TS6133: 'maxSize' is declared but its value is never read.
4:39:36 PM: src/types/file/utilities.ts(269,50): error TS2339: Property 'file' does not exist on type 'never'.
4:39:36 PM: src/types/file/utilities.ts(270,50): error TS2339: Property 'file' does not exist on type 'never'.
4:39:36 PM: src/types/index.ts(19,1): error TS2308: Module './auth' has already exported a member named 'User'. Consider explicitly re-exporting to resolve the ambiguity.
4:39:36 PM: src/types/index.ts(22,15): error TS2306: File '/opt/build/repo/Front/src/types/manager.ts' is not a module.
4:39:36 PM: src/types/index.ts(64,3): error TS2305: Module '"./auth"' has no exported member 'LoginRequest'.
4:39:36 PM: src/types/index.ts(66,3): error TS2305: Module '"./auth"' has no exported member 'UserInfo'.
4:39:36 PM: src/types/quota.ts(482,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaResponse'.
4:39:36 PM: src/types/quota.ts(483,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaCreateRequest'.
4:39:36 PM: src/types/quota.ts(484,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaUpdateRequest'.
4:39:36 PM: src/types/quota.ts(485,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaSearchFilters'.
4:39:36 PM: src/types/quota.ts(486,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaListResponse'.
4:39:36 PM: src/types/quota.ts(489,3): error TS2484: Export declaration conflicts with exported declaration of 'DepartmentQuotaStatusResponse'.
4:39:36 PM: src/types/quota.ts(490,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaAnalyticsSummary'.
4:39:36 PM: src/types/quota.ts(493,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaResetResponse'.
4:39:36 PM: src/types/quota.ts(494,3): error TS2484: Export declaration conflicts with exported declaration of 'BulkQuotaOperationResponse'.
4:39:36 PM: src/types/quota.ts(497,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaFormState'.
4:39:36 PM: src/types/quota.ts(498,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaFormErrors'.
4:39:36 PM: src/types/quota.ts(499,3): error TS2484: Export declaration conflicts with exported declaration of 'DepartmentOption'.
4:39:36 PM: src/types/quota.ts(500,3): error TS2484: Export declaration conflicts with exported declaration of 'LLMConfigOption'.
4:39:36 PM: src/types/quota.ts(503,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaType'.
4:39:36 PM: src/types/quota.ts(504,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaPeriod'.
4:39:36 PM: src/types/quota.ts(505,3): error TS2484: Export declaration conflicts with exported declaration of 'QuotaStatus'.
4:39:36 PM: src/types/usage.ts(524,3): error TS2484: Export declaration conflicts with exported declaration of 'UsageSummary'.
4:39:36 PM: src/types/usage.ts(525,3): error TS2484: Export declaration conflicts with exported declaration of 'UserUsageStats'.
4:39:36 PM: src/types/usage.ts(526,3): error TS2484: Export declaration conflicts with exported declaration of 'DepartmentUsageStats'.
4:39:36 PM: src/types/usage.ts(527,3): error TS2484: Export declaration conflicts with exported declaration of 'TopUsersResponse'.
4:39:36 PM: src/types/usage.ts(528,3): error TS2484: Export declaration conflicts with exported declaration of 'RecentLogsResponse'.
4:39:36 PM: src/types/usage.ts(529,3): error TS2484: Export declaration conflicts with exported declaration of 'UsageSystemHealth'.
4:39:36 PM: src/types/usage.ts(530,3): error TS2484: Export declaration conflicts with exported declaration of 'DashboardData'.
4:39:36 PM: src/types/usage.ts(531,3): error TS2484: Export declaration conflicts with exported declaration of 'ProviderChartData'.
4:39:36 PM: src/types/usage.ts(532,3): error TS2484: Export declaration conflicts with exported declaration of 'DashboardState'.
4:39:36 PM: src/types/usage.ts(533,3): error TS2484: Export declaration conflicts with exported declaration of 'UsageFilters'.
4:39:36 PM: src/types/usage.ts(534,3): error TS2484: Export declaration conflicts with exported declaration of 'UsageInsights'.
4:39:36 PM: src/utils/chatHelpers.ts(326,9): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
4:39:36 PM: src/utils/streamingStateManager.ts(261,7): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
4:39:36 PM: src/utils/tokenManager.ts(18,25): error TS2503: Cannot find namespace 'NodeJS'.
4:39:36 PM: ​
4:39:36 PM: "build.command" failed                                        
4:39:36 PM: ────────────────────────────────────────────────────────────────
4:39:36 PM: ​
4:39:36 PM:   Error message
4:39:36 PM:   Command failed with exit code 2: npm run build
4:39:36 PM: ​
4:39:36 PM:   Error location
4:39:36 PM:   In Build command from Netlify app:
4:39:36 PM:   npm run build
4:39:36 PM: ​
4:39:36 PM:   Resolved config
4:39:36 PM:   build:
4:39:36 PM:     base: /opt/build/repo/Front
4:39:36 PM:     command: npm run build
4:39:36 PM:     commandOrigin: ui
4:39:36 PM:     publish: /opt/build/repo/Front
4:39:36 PM:     publishOrigin: ui
4:39:36 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
4:39:36 PM: Failing build: Failed to build site
4:39:36 PM: Finished processing build request in 17.683s


explain to me whats wrong here
This build error output shows that your TypeScript project is failing to compile due to numerous TypeScript errors during the Netlify build process. Let me break down the main issues:

Key Problems:
TypeScript Compilation Errors (TS Errors):

There are over 100 TypeScript errors causing the build to fail

The main command npm run build (which runs tsc && vite build) failed with exit code 2

Major Categories of Errors:

a) Unused Variables/Imports (TS6133):

Many React components have unused imports (React, icons, variables)

Example: React is declared but its value is never read

b) Type Mismatches (TS2322, TS2345):

Incompatible type assignments between components and their props

Example: Type 'null' is not assignable to type 'number | undefined'

c) Missing Properties (TS2339):

Trying to access properties that don't exist on types

Example: Property 'default_version' does not exist on type 'LLMProviderInfo'

d) Module/Type Resolution Issues:

Missing type definitions (@types/node, @types/jest)

Example: Cannot find name 'process'. Do you need to install @types/node?

e) Duplicate/Conflicting Exports (TS2484, TS2308):

Multiple exports with the same name

Example: Export declaration conflicts with exported declaration of 'QuotaResponse'

Root Causes:
Strict TypeScript Configuration:

Your project appears to have strict TypeScript checks enabled, catching many potential issues

Missing Type Definitions:

Lack of @types/node for Node.js types

Lack of @types/jest for test files

Code Quality Issues:

Many unused imports and variables

Type definitions not properly aligned between components

Possible Recent Changes:

The errors suggest some recent changes may have introduced type mismatches or broken type definitions

Recommended Solutions:
Immediate Fix:

bash
npm install --save-dev @types/node @types/jest
Systematic Approach:

Start by fixing the most critical errors first (type mismatches, missing properties)

Then clean up unused imports and variables

Finally resolve the duplicate/conflicting exports

Development Recommendations:

Run TypeScript checks locally before pushing:

bash
tsc --noEmit
Configure your IDE to show TypeScript errors in real-time

Consider adding ESLint with TypeScript support to catch these issues earlier

Specific Fixes Needed:

Update type definitions to match component expectations

Remove unused imports and variables

Fix property access on types where properties are missing

Resolve conflicting type exports

The build is failing because TypeScript is treating these errors as blocking issues. You'll need to address enough of them to get the compilation to succeed before Netlify can complete the build.

Would you like me to elaborate on any specific category of errors or suggest more targeted fixes for particular files?

New chat
Message DeepSeek
AI-generated, for reference only
