<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Edit Server' : 'Add Remote Server' }}</h3>
        <button class="btn-close" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Server Name *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g.: Production Server"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Host Address *</label>
            <input
              v-model="form.host"
              type="text"
              placeholder="e.g.: 192.168.1.100"
              class="form-input"
            />
          </div>
          <div class="form-group" style="max-width: 120px">
            <label>Port *</label>
            <input v-model.number="form.port" type="number" placeholder="22" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label>Username *</label>
          <input v-model="form.username" type="text" placeholder="e.g.: root" class="form-input" />
        </div>

        <div class="form-group">
          <label>Authentication Method</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="form.authType" type="radio" value="password" />
              <span>Password</span>
            </label>
            <label class="radio-label">
              <input v-model="form.authType" type="radio" value="key" />
              <span>Private Key</span>
            </label>
          </div>
        </div>

        <div v-if="form.authType === 'password'" class="form-group">
          <label>Password *</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter SSH password"
            class="form-input"
            autocomplete="new-password"
          />
        </div>

        <div v-if="form.authType === 'key'" class="form-group">
          <label>Private Key Path *</label>
          <div class="input-with-button">
            <input
              v-model="form.privateKeyPath"
              type="text"
              placeholder="/Users/username/.ssh/id_rsa"
              class="form-input"
            />
            <button class="btn-browse" @click="browsePrivateKey">Browse</button>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.isMock" type="checkbox" />
            <span>Use Mock mode (for testing, no real server needed)</span>
          </label>
        </div>

        <div v-if="form.isMock" class="mock-notice">
          <span class="notice-icon">ℹ️</span>
          <div>
            <strong>Mock Mode</strong>
            <p>
              Mock mode generates simulated command history data without connecting to a real server. This is useful for development and testing.
            </p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">Cancel</button>
        <button class="btn-save" @click="saveServer" :disabled="!isFormValid">
          {{ isEdit ? 'Save' : 'Add' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  server: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  host: '',
  port: 22,
  username: '',
  authType: 'password',
  password: '',
  privateKeyPath: '',
  isMock: true
})

const isEdit = computed(() => !!props.server)

const isFormValid = computed(() => {
  if (!form.value.name || !form.value.host || !form.value.username) {
    return false
  }

  // Mock mode doesn't require authentication validation
  if (form.value.isMock) {
    return true
  }

  if (form.value.authType === 'password') {
    return !!form.value.password
  } else {
    return !!form.value.privateKeyPath
  }
})

watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      if (props.server) {
        // Edit mode - fill existing data
        form.value = {
          name: props.server.name,
          host: props.server.host,
          port: props.server.port,
          username: props.server.username,
          authType: props.server.authType,
          password: '', // Don't populate password
          privateKeyPath: props.server.privateKeyPath || '',
          isMock: props.server.isMock
        }
      } else {
        // Add mode - reset form
        form.value = {
          name: '',
          host: '',
          port: 22,
          username: '',
          authType: 'password',
          password: '',
          privateKeyPath: '',
          isMock: true
        }
      }
    }
  }
)

function closeModal() {
  emit('close')
}

function saveServer() {
  if (!isFormValid.value) return

  const serverData = {
    name: form.value.name.trim(),
    host: form.value.host.trim(),
    port: form.value.port,
    username: form.value.username.trim(),
    authType: form.value.authType,
    isMock: form.value.isMock
  }

  if (form.value.authType === 'password') {
    serverData.password = form.value.password
  } else {
    serverData.privateKeyPath = form.value.privateKeyPath.trim()
  }

  if (props.server) {
    serverData.id = props.server.id
  }

  emit('save', serverData)
  closeModal()
}

function browsePrivateKey() {
  // TODO: Use Electron file dialog
  alert('File browsing feature coming soon')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-dialog {
  background: var(--bgSecondary);
  border: 1px solid var(--borderPrimary);
  border-radius: 12px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--borderPrimary);
  background: var(--bgPrimary);
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--textPrimary);
}

.btn-close {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--textSecondary);
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: var(--bgHover);
  color: var(--textPrimary);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  background: var(--bgSecondary);
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--textPrimary);
}

.form-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--borderPrimary);
  border-radius: 6px;
  background: var(--bgPrimary);
  color: var(--textPrimary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: var(--textTertiary);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--textPrimary);
}

.radio-label input[type='radio'] {
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--textPrimary);
}

.checkbox-label input[type='checkbox'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button .form-input {
  flex: 1;
}

.btn-browse {
  padding: 0 14px;
  border: 1px solid var(--borderPrimary);
  background: var(--bgPrimary);
  color: var(--textPrimary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-browse:hover {
  border-color: var(--borderSecondary);
  background: var(--bgHover);
}

.mock-notice {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 6px;
  font-size: 13px;
}

.notice-icon {
  font-size: 20px;
}

.mock-notice strong {
  display: block;
  margin-bottom: 4px;
  color: var(--textPrimary);
}

.mock-notice p {
  margin: 0;
  color: var(--textSecondary);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--borderPrimary);
  background: var(--bgPrimary);
}

.btn-cancel,
.btn-save {
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: var(--bgSecondary);
  color: var(--textPrimary);
  border: 1px solid var(--borderPrimary);
}

.btn-cancel:hover {
  background: var(--bgHover);
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
