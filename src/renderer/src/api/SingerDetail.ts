import request from '../utils/request';

//歌手详情
export const singerDeatil = (params: object) => request({
    url: '/artists',
    params
})

// 歌手全部歌曲
export const singerSongs = (params: object) => request({
    url: '/artist/songs',
    params
})

// 歌手全部专辑
export const singerAlbums = (params: object) => request({
    url: '/artist/album',
    params
})

// 歌手全部MV
export const singerMVs = (params: object) => request({
    url: '/artist/mv',
    params
})