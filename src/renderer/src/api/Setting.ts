import request from '../utils/request';

// 版本号
export const innerVersion = (params: object) => request({
    url: '/inner/version',
    params
})