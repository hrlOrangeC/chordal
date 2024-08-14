import request from '../utils/request';

export const newLyric = params => request({
    url: '/lyric/new',
    params
})