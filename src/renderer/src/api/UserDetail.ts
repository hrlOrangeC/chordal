import request from '../utils/request';

// 获取用户详情
export const userDetail = (params: object) => request({
    url: '/user/detail',
    params
})
export const userRecord = (params: object) => request({
    url: '/user/record',
    params
})

// 获取用户歌单
export const userPlayList = (params: object) => request({
    url: '/user/playlist',
    params
})
