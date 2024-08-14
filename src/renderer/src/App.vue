<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="el-fade-in-linear" appear mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
import { useRouter } from 'vue-router';
import request from "./utils/request";
import { setTheme } from '@renderer/style/theme';

const router = useRouter();

onMounted(() => {
  if (!localStorage.getItem("baseurl")) {
    router.replace({
      name: "welcome"
    })
  } else {
    request.defaults.baseURL = localStorage.getItem("baseurl") as string;
  }

  setTheme('theme0');
})
</script>
<style lang="less">
.el-message {
  background-color: @bgiSColor !important;
  border: none;
  top: 10%;
  padding: 1vw;
  gap: .5vw;

  p {
    color: @fontColor !important;
    font-size: 1vw;
  }
}

.el-button {
  border: none;

}

.el-image-viewer__wrapper {
  -webkit-app-region: no-drag;

  .el-image-viewer__actions {
    width: 22vw;
    height: 3vw;
  }

  .el-image-viewer__close {
    width: 3vw;
    height: 3vw;
  }

  * {
    font-size: 1.4vw
  }

}

.el-loading-spinner .path {
  stroke: @maxColor;
}

.el-loading-mask {
  z-index: auto;
}

.el-loading-parent--relative {
  position: inherit !important;
}

.el-empty {
  padding: 5vw;

  .el-empty__image {
    width: 12vw
  }

  .el-empty__description {
    p {
      font-size: 1vw
    }

  }
}

.el-scrollbar__bar.is-vertical {
  width: .5vw
}

.el-backtop {
  right: 5% !important;
  bottom: 15% !important;
  background-color: @maxColor !important;
  color: @fontColor !important;
  width: 3vw;
  height: 3vw;

  i {
    font-size: 1.5vw;
  }
}

.el-loading-spinner {
  svg {
    width: 4vw !important;
    height: 4vw !important;
  }

}

.el-popover.el-popper {
  background-color: @bgiSColor !important;
  border: none;
  font-size: 1vw;
  padding: 1vw;
  min-width: 2vw !important;
  width: auto !important;
  line-height: auto;
  border-radius: .1vw;

  .el-popconfirm__action {
    text-align: center
  }

  .el-popper__arrow::before {
    background-color: @bgiSColor !important;
    border: none;
  }

  .el-button {
    transition: all .25s ease-in-out;
  }

  .el-button--danger {
    background-color: @maxColor;
    border: none;
  }
}

.el-overlay {
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 10000 !important;

  .el-overlay-dialog {
    .el-dialog {
      padding: 1.5vw;
      width: 30%;
      height: auto !important;
      margin: 15% auto;
      background: @bgiSColor;

      * {
        font-size: 1vw !important;
        color: @fontColor;
      }

      .el-dialog__header {
        padding-bottom: 1vw;
        height: 4vw;

        * {
          font-size: 1.1vw !important;
        }
      }

      .el-dialog__header.show-close {
        padding-right: 1vw;

      }

      .el-dialog__headerbtn {
        width: 4.75vw;
        height: 4.75vw;

        * {
          font-size: 1.5vw !important;
        }
      }

      .el-dialog__footer {
        padding-top: 1vw;

        .el-button {
          width: auto;
          height: 2.5vw;
          border-radius: .1vw;
          margin-left: 2vw;
          padding: 1vw;

          * {
            font-size: 1.1vw !important;
            color: @whiteGreyColor !important;
          }
        }
      }
    }
  }
}

.sliderBox {
  height: .5vw;
  top: 50%;
  transform: translateY(-50%);

  .el-slider {
    height: .5vw;
    transform: skew(-15deg);

    .el-slider__runway {
      height: .5vw;
      border-radius: 0;
      background-color: @whiteGreyColor;

      .el-slider__bar {
        height: .5vw;
        background-color: @maxColor;
        border-radius: 0;
      }

      .el-slider__button-wrapper {
        .flexCenter();
        width: auto;
        height: 1.5vw;
        top: -1vw;
        transform: translateY(.5vw) translateX(-50%);

        .el-slider__button {
          border: 0;
          border-radius: 0;
          width: .75vw;
          height: 1.5vw;
        }
      }
    }
  }
}


@font-face {
  font-style: normal;
  font-family: 'Harmony_Regular';
  src: url('./fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_Regular.ttf') format('truetype');
}

@font-face {
  font-style: normal;
  font-family: 'Harmony_Medium';
  src: url('./fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_Medium.ttf') format('truetype');
}

@font-face {
  font-style: normal;
  font-family: 'Harmony_Black';
  src: url('./fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_Black.ttf') format('truetype');
}

@font-face {
  font-style: normal;
  font-family: 'Harmony_Light';
  src: url('./fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_Light.ttf') format('truetype');
}

@font-face {
  font-style: normal;
  font-family: 'Harmony_Bold';
  src: url('./fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_Bold.ttf') format('truetype');
}

@font-face {
  font-style: normal;
  font-family: 'Harmony_Thin';
  src: url('./fonts/HarmonyOS_Sans_SC/HarmonyOS_Sans_SC_Thin.ttf') format('truetype');
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: 'Harmony_Regular', sans-serif;
  user-select: none;
}

/*::-webkit-scrollbar {
  width: 5px;
  cursor: pointer;
}

*::-webkit-scrollbar-track {
  background-color: #ffffff;
  border-radius: 100px;
}

*::-webkit-scrollbar-thumb {
  background-color: rgb(223, 223, 223);
  border-radius: 100px;
}*/

img {
  -webkit-user-drag: none;
}

body,
html {
  width: 100%;
  height: 100%;
  font-size: 0.9vw;
  color: @fontColor
}

#app {
  width: 100%;
  height: 100%;
  // background-color: @bgiColor;
}
</style>
