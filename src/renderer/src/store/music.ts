import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMusicStore = defineStore('music', () => {
    const nowMusic = ref<any>({ ar: [{ id: null }] });
    const played = ref<boolean>(false);
    const musicList = ref<any[]>([]);
    const searchHistory = ref<{type: number; keyword: string}>({ type: 0, keyword: "" });
    const singerHistory = ref<{stype: number}>({ stype: 1 });
    const lyricShow = ref<boolean>(false);
    const lyricMode = ref<boolean>(false);

    return { nowMusic, played, musicList, searchHistory, singerHistory, lyricShow, lyricMode }
})