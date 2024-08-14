<template>
    <div id="Login" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.75)">
        <div class="lTop">
            <close theme="outline" @click="closeLogin" />
        </div>
        <div class="lBottom">
            <div class="lBTBox">
                <transition name="el-fade-in-linear" appear mode="out-in">
                    <KeepAlive>
                        <div class="qBox" v-if="nowType == 0">
                            <div class="titleBox">扫码登录</div>
                            <div class="qrBox">
                                <canvas id="QRCode_header" ref="canvas"></canvas>
                            </div>
                            <div class="mesBox">{{ qrMessage }}</div>
                        </div>
                        <div class="phoneBox" v-else>
                            <div class="imgBox"><img src="../../imgs/record.png" ref="img" /></div>
                            <el-input v-model="phoneNum" placeholder="请输入手机号" v-if="nowType == 1" />
                            <el-input v-model="emailValue" placeholder="请输入邮箱" v-else />
                            <el-input v-model="passWord" type="password" placeholder="请输入密码" show-password
                                v-if="phoneMode || nowType != 1">
                            </el-input>
                            <el-input v-model="capValue" placeholder="请输入验证码" v-else>
                                <template #append>
                                    <el-button>
                                        <span v-if="capTime == 60" @click="getCap">获取验证码</span>
                                        <span v-else>{{ capTime }}</span>
                                    </el-button>
                                </template>
                            </el-input>
                            <div class="btnBox">
                                <el-button :color="color" dark @click="phoneLogin">
                                    登录
                                </el-button>
                                <el-button :color="color" dark text class="textBtn" @click="phoneMode = !phoneMode"
                                    v-if="nowType == 1">
                                    {{ `${phoneMode ? "验证码" : "密码"}登录` }}
                                </el-button>
                            </div>
                        </div>
                    </KeepAlive>
                </transition>
            </div>
            <div class="lBBBox">
                <Segmented :iconList="iconList" :moveDistance="nowType" :liWidth="27.5" :liHeight="7.5"
                    @jumpSearch="jumpBox" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import QRCode from "qrcode";
import { ref, onMounted, nextTick } from 'vue';
import { Close } from '@icon-park/vue-next';
import { keyAPI, QRCodeAPI, QRCheckAPI, loginCellAPI, capSentAPI, loginEmailAPI } from '../../api/index';
import Segmented from "../../components/Segmented.vue";
import { useIpcRenderer } from "@vueuse/electron";
import { ElMessage } from 'element-plus'

const ipcRenderer = useIpcRenderer();

const checkTimer = ref();
const qrMessage = ref<string>("等待扫码");
const nowType = ref<number>(0);
const phoneNum = ref<string>("");
const passWord = ref<string>("");
const capValue = ref<string>("");
const emailValue = ref<string>("");
const capTime = ref<number>(60);
const color = ref<string>();
const phoneMode = ref<boolean>(true);
const loading = ref<boolean>(false);
const iconList = ref<{ name: string, type: number }[]>([
    {
        name: "二维码",
        type: 0
    },
    {
        name: "手机",
        type: 1
    },
    {
        name: "邮箱",
        type: 2
    }
])

const canvas = ref();

// 二维码登录
const qrLogin = async () => {
    const { unikey } = {
        ...await keyAPI({
            timestamp: Date.now(),
        })
    }.data.data;
    const qr = await QRCodeAPI({
        key: unikey,
        timestamp: Date.now()
    });
    await QRCode.toCanvas(canvas.value, qr.data.data.qrurl, { width: canvas.value?.parentElement.offsetWidth * 0.6, margin: 1 });
    checkTimer.value = setInterval(async () => {
        const { message, code, cookie } = {
            ...await QRCheckAPI({
                key: unikey,
                timestamp: Date.now()
            })
        }.data;
        qrMessage.value = message;
        if (code == 803)
            ipcRenderer.send("loginModal-send", cookie);
    }, 1000)
}

// 手机/邮箱登录 (邮箱登录不可用)
const phoneLogin = async () => {
    const phone = phoneNum.value.trim();
    const email = emailValue.value.trim();
    const password = passWord.value.trim();
    const captcha = capValue.value.trim();
    const messageMode = phoneMode.value ? "密码" : "验证码";
    const messageTMode = nowType.value == 2 ? "邮箱" : "手机号";
    if (!loginVerify([nowType.value == 2 ? email : phone, phoneMode.value ? password : captcha], `${messageTMode}或${messageMode}不能为空`)) return;
    loading.value = true;
    await (nowType.value == 2 ? loginEmailAPI({ email, password }) :
        loginCellAPI(phoneMode.value ? { phone, password } : { phone, captcha })).then((res) => {
            res.data.code == 200 ? ipcRenderer.send("loginModal-send", res.data.cookie) : setMessage({ message: res.data.message, type: "error" });
        }).catch((error) => {
            setMessage({ message: error.message, type: "error" });
        })
    loading.value = false;
}

// 登录验证
const loginVerify = (arr: string[], message: string) => {
    const flag = arr.some(i => i.length == 0);
    if (flag) {
        setMessage({ message, type: "error" });
        return false;
    } else {
        return true
    }
}

// 发送验证码
const getCap = async () => {
    const phone = phoneNum.value.trim();
    if (!loginVerify([phone], `手机号不能为空`)) return;
    loading.value = true;
    const { code, message } = { ...await capSentAPI({ phone }) }.data;
    if (code == 200) {
        setMessage({ message: "验证码发送成功", type: "success" });
        const timer = setInterval(() => {
            capTime.value--;
            if (capTime.value == 0) {
                clearInterval(timer);
                capTime.value = 60;
            };
        }, 1000)
    } else {
        setMessage({ message, type: "error" });
    }
    loading.value = false;
}

// 切换登录方式
const jumpBox = async (type: number) => {
    nowType.value = type;
    type != 0 ? clearInterval(checkTimer.value) : await qrLogin();
}

// 关闭窗体
const closeLogin = () => {
    ipcRenderer.send("close-loginModal");
}

// 弹出提示
const setMessage = (obj) => {
    ElMessage({
        message: obj.message,
        type: obj.type,
        plain: true
    });
}

onMounted(async () => {
    await qrLogin();

    nextTick(() => {
        color.value = getComputedStyle(canvas.value, null).color
    })
})
</script>
<style lang="less">
.el-input__wrapper {
    box-shadow: none !important;
    height: 7vh;
    font-size: 3.5vw;
}

.el-input-group__append {
    padding: 0 2vw
}

.el-message {
    padding: 3.5vw;
    gap: 1vw;
    font-size: 3.5vw;

    p {
        font-size: 3.5vw;
    }
}

.el-loading-spinner {
  svg {
    width: 12vw !important;
    height: 12vw !important;
  }

}

#Login {
    .absolutely();
    font-size: 3.5vw;
    display: flex;
    flex-direction: column;
    background-color: @bgiSColor;
    overflow: hidden;

    .lTop {
        -webkit-app-region: drag;
        text-align: right;
        padding: 5%;

        >span {
            font-size: 6vw;
            cursor: pointer;
            -webkit-app-region: no-drag;
        }
    }

    .lBottom {
        display: flex;
        flex-direction: column;
        .absolutely();

        >div {
            flex: 1;
        }

        .lBTBox {
            flex: 6;

            .qBox {
                .flexCenter();
                flex-direction: column;

                .titleBox {
                    font-size: 6vw;
                    margin: 3vw 0;
                }

                .qrBox {
                    width: 100%;
                    height: 50vh;
                    .flexCenter();

                    canvas {
                        color: @maxColor
                    }
                }
            }

            .phoneBox {
                .absolutely();
                .flexCenter();
                flex-direction: column;

                .imgBox {
                    margin-bottom: 7.5vw;

                    img {
                        width: 20vw;
                    }
                }

                .el-input {
                    width: 70%;
                    margin: 3vw 0;

                    .el-button {
                        height: 100%;
                        font-size: 3.5vw;
                        padding: 0;
                        margin: 0
                    }
                }

                .btnBox {
                    width: 70%;
                    display: flex;
                    justify-content: center;

                    .el-button {
                        width: 50%;
                        font-size: 4vw;
                        margin: 6vw 3vw;
                        height: 5.5vh;
                        color: @whiteGreyColor;
                        border-radius: 1vw;
                        padding: 4vw 4vh;
                    }

                    .textBtn:hover {
                        background-color: @bgiSColor;
                    }
                }

            }

        }

        .lBBBox {
            flex: 2
        }
    }
}
</style>