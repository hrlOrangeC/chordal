import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
    const loginStatus = ref<boolean>(false);
    const userDetail = ref<any>({});

    const notLogin = () => {
        if (!loginStatus.value) {
            ElMessage({
                message: "请先行登录再进行此操作",
                type: "error",
                plain: true
            });
            return false;
        }
        return true;
    }
    return { loginStatus, userDetail, notLogin }
})