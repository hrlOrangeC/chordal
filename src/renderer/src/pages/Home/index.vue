<template>
  <div id="home">
    <div id="hTop">
      <div id="iconBox" ref="getColor">
        <img src="../../imgs/record.png" @click="jumpPage('homepage', null)" />
      </div>
      <div id="titleBox"><span v-if="route.meta.latency">chor</span><span v-if="route.meta.latency">dal</span></div>
      <div id="menuBox">
        <div>
          <search theme="outline" strokeLinejoin="miter" strokeLinecap="butt"
            @click="jumpPage('search', musicStore.searchHistory)" v-show="route.name != 'search'" />
        </div>
        <div>
          <remind theme="outline" strokeLinejoin="miter" strokeLinecap="butt" />
        </div>
        <div id="userBox">
          <el-popover v-model:visible="popoverShow" placement="bottom" trigger="click" :teleported="false"
            :disabled="!userStore.loginStatus">
            <template #reference>
              <div>
                <transition name="el-fade-in-linear" appear mode="out-in">
                  <div v-if="userStore.loginStatus">
                    <img :src="userStore.userDetail?.avatarUrl" />
                    <down-one theme="filled" />
                  </div>
                  <img src="../../imgs/record.png" @click="createWindow" v-else />
                </transition>
              </div>
            </template>
            <ul @click="popoverShow = false">
              <li @click="jumpPage('userdetail', { id: userStore.userDetail.userId })">
                <me theme="outline" />个人信息
              </li>
              <li @click="dialogVisible = true">
                <logout theme="outline" />退出登录
                <el-dialog v-model="dialogVisible" :append-to-body="true" title="提示">
                  <span>确定要退出登录吗?</span>
                  <template #footer>
                    <div class="dialog-footer">
                      <el-button :color="colorStore.maxColor" link dark @click="dialogVisible = false">取消</el-button>
                      <el-button :color="colorStore.maxColor" dark type="primary" @click="toLogout">
                        确定
                      </el-button>
                    </div>
                  </template>
                </el-dialog>
              </li>
            </ul>
          </el-popover>
        </div>
        <div>
          <hamburger-button theme="outline" strokeLinejoin="miter" strokeLinecap="butt"
            @click="jumpPage('setting', null)" />
        </div>
      </div>
    </div>
    <div id="hCenter">
      <el-scrollbar max-height="100%" @scroll="onScroll" ref="scroll">
        <router-view v-slot="{ Component }" :playbackProgress="playbackProgress" :scrollNum="scrollNum"
          @jumpScroll="jumpScroll">
          <transition name="el-fade-in-linear" appear mode="out-in" @enter="onEnter">
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </transition>
        </router-view>
        <el-backtop :right="100" :bottom="100" target=".el-scrollbar__wrap" />
      </el-scrollbar>
    </div>
    <div id="hBottom">
      <div id="jumpLBox" @click="jumpMusic(false)">
        <el-icon>
          <Back />
        </el-icon>
      </div>
      <div id="hBCenter">
        <div id="playBox">
          <div id="controlBox">
            <div id="stopIcon"></div>
            <el-icon v-if="musicLoading" class="is-loading">
              <Loading />
            </el-icon>
            <el-icon @click="playMusic(false)" v-else-if="musicStore.played">
              <VideoPause />
            </el-icon>
            <el-icon @click="playMusic(true)" v-else>
              <VideoPlay />
            </el-icon>
          </div>
          <div id="progressBox">
            <div id="progress" ref="progress">
              <!--<ul>
                <div id="sliderBox">
                  <div></div>
                </div>
                
                <li v-for="(num, index) in output" @click="jumpTime(index * musicStore.nowMusic.dt / 1000 / 70)"
                  :style="{ transform: `translateY(${92.5 - (num / 255 * 92.5)}%)`, backgroundColor: playbackProgress > index * musicStore.nowMusic.dt / 1000 / 70 ? 'rgb(238, 28, 37)' : '#DCDCDC' }">
                </li>
              </ul>-->
              <div id="nowTime">{{ dayjs.duration(playbackProgress, 'seconds').format('mm:ss') }}</div>
              <div id="endTime">{{ dayjs(musicStore.nowMusic.dt).format("mm:ss") }}</div>
              <canvas ref="canvas"></canvas>
              <div class="sliderBox">
                <el-slider v-model="playbackProgress" :disabled="musicLoading" :max="musicStore.nowMusic.dt / 1000"
                  :step="0.01" :show-tooltip="false" @mousedown="sliderDown()" @change="jumpTime" />
              </div>
            </div>
          </div>
        </div>
        <div id="occBox"></div>
      </div>
      <div id="jumpRBox" @click="jumpMusic(true)">
        <el-icon>
          <Right />
        </el-icon>
      </div>
    </div>
    <transition name="el-fade-in-linear" appear mode="out-in">
      <VirtualRoulette v-if="rouleShow" @changeRouleShow="changeRouleShow" />
    </transition>
    <transition name="el-fade-in-linear" appear mode="out-in">
      <MusicHistory v-if="MusicHistoryShow" />
    </transition>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount } from 'vue'
// import Model from "../../components/model.vue"
import VirtualRoulette from '../../components/VirtualRoulette.vue';
import MusicHistory from '@renderer/components/MusicHistory.vue';
import { musicUrlVIPAPI, loginStatusAPI } from '../../api/index'
import { useColorStore } from '../../store/color';
import { useMusicStore } from '../../store/music';
import { useUserStore } from '../../store/user';
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { Search, Remind, HamburgerButton, DownOne, Me, Logout } from '@icon-park/vue-next';
import duration from 'dayjs/plugin/duration';
import { useIpcRenderer } from "@vueuse/electron";
import { ElMessage } from 'element-plus'
dayjs.extend(duration);

const router = useRouter();
const route = useRoute();

const ipcRenderer = useIpcRenderer();

const scroll = ref();

const colorStore = useColorStore();
const musicStore = useMusicStore();
const userStore = useUserStore();

const scrollNum = ref<number>(0);
const musicUrl = ref<string>();
const playbackProgress = ref<number>(0);
// const playbackProgressTimer = ref();
const spectrumTimer = ref();
const outputUtf8 = ref<Uint8Array>(new Uint8Array(60));
const analyser = ref();
const oldMusic = ref<{ id: string }>();
const musicLoading = ref<boolean>(false);
const rouleShow = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const popoverShow = ref<boolean>(false);
const musicTimer = ref();
const MusicHistoryShow = ref<boolean>(false);
const isUpdate = ref<boolean>(true);

let audio;
const getColor = ref();
const canvas = ref();
const ctx = ref<{ item: any, width: number, height: number }>({
  item: null,
  width: 0,
  height: 0
});
const pageScroll = ref<{ name: string, scroll: number }[]>([])
/*const getSongDetail = async (ids: number | string) => {
  musicStore.nowMusic = { ...(await songDetailAPI({ ids })) }.data.songs[0];
}*/


// 获取音乐url
const getMusicUrl = async (id: number | string) => {
  musicUrl.value = { ...await musicUrlVIPAPI({ id }) }.data.data[0].url;
}

// 播放控制
const playMusic = (mode: boolean) => {
  musicStore.played = mode;
  if (mode) {
    audio.play();
    // getPlaybackProgress();
    runSpectrum();
  } else {
    audio.pause();
    // cancelAnimationFrame(playbackProgressTimer.value);
    cancelAnimationFrame(spectrumTimer.value);
  }
}

// 创建audio
const generateAudio = () => {
  audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.onended = () => {
    playMusic(false);
  };
  audio.ontimeupdate = () => {
    if (isUpdate.value)
      playbackProgress.value = audio.currentTime;
  };
  audio.oncanplay = () => {
    musicLoading.value = false;
    if (!musicStore.played && oldMusic.value?.id) playMusic(true);
  };
}

// 获取currentTime
/*const getPlaybackProgress = () => {
  playbackProgress.value = audio.currentTime;
  playbackProgressTimer.value = requestAnimationFrame(getPlaybackProgress);
}*/

// 音频上下文
const createSpectrum = () => {
  const AudioContext = window.AudioContext;
  const context = new AudioContext();
  const cmSource = context.createMediaElementSource(audio);

  analyser.value = context.createAnalyser();

  cmSource.connect(analyser.value);
  analyser.value.connect(context.destination);
}

// 绘制频谱图
const getOutput = () => {
  analyser.value.getByteFrequencyData(outputUtf8.value);
  ctx.value.item.clearRect(0, 0, ctx.value.width, ctx.value.height);
  for (let i = 0; i < 60; i++) {
    ctx.value.item.fillStyle = playbackProgress.value >= i * musicStore.nowMusic.dt / 1000 / 60 ? colorStore.maxColor : '#DCDCDC';
    ctx.value.item.fillRect(i * 5, ctx.value.height, 2, -outputUtf8.value[i] / 2 - 10);
  }
  runSpectrum();
}

// 开始绘制
const runSpectrum = () => {
  spectrumTimer.value = requestAnimationFrame(getOutput);
}

// 创建画布
const createCtx = () => {
  ctx.value.item = canvas.value.getContext("2d");
  ctx.value.width = canvas.value.width;
  ctx.value.height = canvas.value.height;
}

// 更新音乐数据
const updateItem = async () => {
  await getMusicUrl(musicStore.nowMusic.id);
  /*await getSongDetail(musicStore.nowMusic.id);*/
}

// 切歌
const jumpMusic = (mode: boolean) => {
  const index = musicStore.musicList.findIndex(item => item.id == musicStore.nowMusic.id);
  const length = musicStore.musicList.length - 1;
  musicStore.nowMusic = musicStore.musicList[mode ? (index == length ? 0 : index + 1) : (index == 0 ? length : index - 1)];

}

// 播放列表添加
const addMusicList = (value: { id: string }) => {
  const flag = musicStore.musicList.findIndex(item => item.id == value.id);
  // musicStore.musicList.push(flag == -1 ? value : musicStore.musicList.splice(flag, 1)[0]);
  flag == -1 && musicStore.musicList.push(value);
}

// 跳转页面
const jumpPage = (name: string, query: any) => {
  router.push({
    name,
    query
  })
}

// 打开登录子窗体
const createWindow = () => {
  ipcRenderer.send('open-loginModal', '/login');
}

// 解析并存储cookie
const parseCookie = (str: string) => {
  /*const dictionary = ["MUSIC_U", "__csrf", "NMTID"];
  dictionary.map((item) => {
    str
      .split(";")
      .map((i) => i.split("="))
      .map((sitem, sindex, sarr) => {
        if (sitem.some((titem) => titem == item)) {
          let nArr: string[][] = [];
          for (let f = sindex; f < sindex + 4; f++) {
            nArr.push(sarr[f]);
          }
          document.cookie = nArr.map((i) => i.join("=")).join(";");
        }
      });
  });*/
  localStorage.setItem("cookie", str);
}

// 判断登录状态
const detectSignInstatus = async () => {
  const { profile } = { ...await loginStatusAPI({ timestamp: Date.now() }) }.data.data;

  if (profile) {
    userStore.loginStatus = true;
    userStore.userDetail = profile;
  } else {
    userStore.loginStatus = false;
    userStore.userDetail = {};
  }
}

// 退出登录
const toLogout = async () => {
  // await logoutAPI({ timestamp: Date.now() });
  localStorage.removeItem("cookie");
  dialogVisible.value = false;
  await detectSignInstatus();
  setMessage({ message: "退出登录成功", type: "success" })
}

// 弹出提示
const setMessage = (obj) => {
  ElMessage({
    message: obj.message,
    type: obj.type,
    plain: true
  });
}

// 虚拟轮盘
const changeRouleShow = () => {
  rouleShow.value = !rouleShow.value
}

// 跳转进度
const jumpTime = (time: number | string) => {
  audio.currentTime = time;
  isUpdate.value = true;
  // !musicStore.played ? playMusic(true) : getPlaybackProgress();
  !musicStore.played && playMusic(true);
}

// 跳转进度
const sliderDown = async () => {
  isUpdate.value = false;
  // cancelAnimationFrame(playbackProgressTimer.value);
}

const onScroll = (e) => {
  scrollNum.value = e.scrollTop
}

// 跳转scroll
const jumpScroll = (num: number | string) => {
  scroll.value.setScrollTop(num)
}

// 读取scroll并跳转
const onEnter = () => {
  scroll.value.setScrollTop(pageScroll.value.find(i => i.name == route.name)?.scroll || 0);
}

// 记录各page scroll
watch(() => router.currentRoute.value, (_, oldVal) => {
  const pS = pageScroll.value;
  const index = pS.findIndex(i => i.name == oldVal.name);
  index == -1 ? pS.push({
    name: oldVal.name as string,
    scroll: scrollNum.value
  }) : pS[index].scroll = scrollNum.value;
}, { deep: true })

// 切歌事件
watch(() => musicStore.nowMusic, (newValue, oldValue) => {
  clearTimeout(musicTimer.value);
  playMusic(false);
  musicLoading.value = true;
  musicTimer.value = setTimeout(async () => {
    await updateItem();
    audio.src = musicUrl.value;
    oldMusic.value = oldValue;
    addMusicList(newValue);
    localStorage.setItem("musicList", JSON.stringify(musicStore.musicList));
  }, 300)
})

onBeforeMount(async () => {
  await detectSignInstatus();
})

onMounted(async () => {
  createCtx();
  musicStore.musicList = JSON.parse(localStorage.getItem("musicList") as string) || [];
  generateAudio();
  createSpectrum();
  runSpectrum();

  // 获取主题色
  colorStore.maxColor = document.getElementsByTagName('body')[0].style.getPropertyValue('--maxColor');

  if (musicStore.musicList.length != 0 && route.name != "homepage") musicStore.nowMusic = musicStore.musicList[0];

  // 接收login窗体数据
  ipcRenderer.on('mainWindow-on', async (_, cookie: string) => {
    parseCookie(cookie);
    await detectSignInstatus();
    if (userStore.loginStatus) {
      ipcRenderer.send("close-loginModal");
      setMessage({ message: "登录成功", type: "success" });
    } else {
      setMessage({ message: "登录失败，请尝试用其他方法登录", type: "error" });
    }
  });

  window.onkeyup = (event: any) => {
    if (event.key === "e" || event.key === "E") {
      changeRouleShow();
    } else if (event.key === "l" || event.key === "L") {
      musicStore.lyricShow = !musicStore.lyricShow;
      musicStore.lyricShow ? ipcRenderer.send('open-lyricModal', '/lyricmodal') : ipcRenderer.send('close-lyricModal')
    } else if (event.key === "h" || event.key === "H") {
      MusicHistoryShow.value = !MusicHistoryShow.value
    }
  }
})
</script>
<style lang="less">
.history-enter-active,
.history-leave-active {
  transition: all .5s ease-in-out !important;
}

.history-enter-from,
.history-leave-to {
  transform: translateX(125%) !important;
}

#home {
  .absolutely();
  .flexSpance();
  overflow: hidden;
  flex-direction: column;
  background-color: @bgiColor;
  position: relative;
  transition: background-color .25s ease-in-out;

  #hTop {
    width: 100%;
    height: 10%;
    position: absolute;
    top: 0;
    z-index: 999;
    -webkit-app-region: drag;
    .flexSpance();
    align-items: center;

    >div {
      .flexCenter();
      flex: 1;
    }

    #iconBox {
      color: @maxColor;

      img {
        width: 2.5vw;
        position: relative;
        left: -25%;
        cursor: pointer;
        -webkit-app-region: no-drag;
      }
    }

    #titleBox {
      flex: 3;
      font-size: 1.5vw;
      cursor: pointer;

      >span {
        font-family: 'Harmony_Bold', sans-serif;
        -webkit-app-region: no-drag;
      }

      :last-child {
        color: @greyColor;
      }
    }

    #menuBox {
      font-size: 1.3vw;
      // color: v-bind('route.meta.latency ? "@bgiColor" : "@fontColor"');
      * {
        color: @fontColor;
      }
      >div {
        min-width: 1.5vw;
        margin: 0 3.5%;
        cursor: pointer;
        -webkit-app-region: no-drag;
        
      }

      #userBox {

        >div {
          >div {
            .flexCenter();
          }

        }

        img {
          width: 2.25vw;
          height: 2.25vw;
          border-radius: 50%;
        }

        span {
          font-size: 0.8vw;
          margin-left: .25vw;
        }

        ul {
          li:hover {
            color: @maxColor;
          }

          li {
            .flexCenter();
            list-style: none;
            color: @fontColor;
            padding: .5vw 0;
            transition: all .25s ease-in-out;

            >span {
              font-size: 1.4vw;
              margin: 0 0.5vw;
            }
          }
        }
      }
    }
  }

  #hCenter {
    .absolutely();
  }

  #hBottom {
    width: 100%;
    height: 10%;
    position: absolute;
    bottom: 0;
    z-index: 999;
    display: flex;
    overflow: hidden;
    * {
      transition: background-color .25s ease-in-out;
    }

    >div {
      flex: 1;
      .flexCenter();
    }

    #hBCenter {
      .absolutely();
      transform: skew(-15deg) scaleX(1.025);

      >div {
        flex: 1;
        .absolutely();
      }

      #playBox {
        background-color: @bgiSColor;
        display: flex;

        #controlBox {
          flex: 0.7;
          .flexCenter();

          >.el-icon,
          #stopIcon {
            margin: 0 0.5vw;
            cursor: pointer;
          }

          >.el-icon {
            color: @maxColor;
            font-size: 1.6vw;
          }

          #stopIcon {
            width: 1.3vw;
            height: 1.3vw;
            background-color: @greyColor;
            border-radius: 0.2vw;
          }
        }

        #progressBox {
          flex: 2.5;
          transform: skew(15deg);
          position: relative;

          #progress:hover {
            canvas {
              opacity: 0.25;
            }

            .sliderBox {
              opacity: 1;
            }

            #nowTime,
            #endTime {
              top: 20%;
              font-size: .9vw
            }
          }

          #progress {
            display: flex;
            width: 92.5%;
            height: 100%;
            position: relative;

            >* {
              transition: all .25s ease-in-out;
            }

            canvas {
              .absolutely();
              transform: translateY(0)
            }

            .sliderBox {
              .absolutely();
              .flexCenter();
              position: absolute;
              opacity: 0;
            }

            /*#sliderBox {
              position: absolute;
              z-index: 2;
              width: 1.1vw;
              height: 100%;
              background-color: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(0.2vw);
              left: v-bind('playbackProgress / (musicStore.nowMusic.dt / 1000) * 100 + "%"');
              .flexCenter();

              >div {
                width: .1vw;
                height: 100%;
                background-color: @maxColor;
                backdrop-filter: blur(0.2vw);
              }
            }*/

            /*ul {
              display: flex;
              width: 92.5%;
              height: 100%;
              justify-content: space-between;
              align-items: end;
              position: relative;
              overflow: hidden;
              cursor: pointer;

              li {
                list-style: none;
                background-color: grey;
                flex-basis: 3px;
                // flex: 1;
                height: 100%;
                will-change: transform;
                transform: translateY(92.5%);
                transition: transform .05s linear, background-color 1s linear;
              }
            }*/

            #nowTime,
            #endTime {
              position: absolute;
              font-size: 0.7vw;
              top: 50%;
              transform: translateY(-50%);
              font-family: 'Harmony_Bold', sans-serif;
              z-index: 2;
            }

            #nowTime {
              left: 0;
              color: @whiteGreyColor;
            }

            #endTime {
              right: .25vw;
            }
          }
        }
      }

      #occBox {
        transition: all 1s ease-in-out;
      }
    }

    #jumpLBox,
    #jumpRBox {
      flex: 0.125;
      font-size: 1.7vw;
      cursor: pointer;
    }

    #jumpLBox:active {
      transform: translateY(0.1vw);
    }

    #jumpRBox:active {
      transform: translateY(0.1vw) skew(-15deg);
    }

    #jumpLBox {
      background-color: @fontColor;
      // transition: all 1s ease-in-out;

      >.el-icon {
        color: @bgiColor;
      }

    }

    #jumpRBox {
      background-color: @bgiSColor;
      transform: skew(-15deg);
      position: relative;

      >.el-icon {
        transform: skew(15deg);
      }
    }

    #jumpRBox::before {
      content: "";
      position: absolute;
      left: 50%;
      background-color: @bgiSColor;
      transform: skew(15deg);
      .absolutely();
    }

  }
}
</style>
