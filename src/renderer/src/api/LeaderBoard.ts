import request from '../utils/request'

export const topList = (params: object) => request({
    url: '/toplist/detail',
    params
})