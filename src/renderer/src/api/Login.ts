import request from '../utils/request';

// 生成二维码key
export const key = (params: object) => request({
    url: '/login/qr/key',
    params
})

// 生成二维码信息
export const QRCode = (params: object) => request({
    url: '/login/qr/create',
    params
})

// 二维码轮询
export const QRCheck = (params: object) => request({
    url: '/login/qr/check',
    params
})


// 手机号登录 
export const loginCell = (params: object) => request({
    url: '/login/cellphone',
    method: "post",
    params
})

// 发送验证码
export const capSent = (params: object) => request({
    url: '/captcha/sent',
    params
})

// 邮箱登录
export const loginEmail = (params: object) => request({
    url: '/login',
    method: "post",
    params
})

// 退出登录
export const logout = (params: object) => request({
    url: '/logout',
    params
})

// 获取账户信息
export const account = (params: object) => request({
    url: '/user/account',
    params
})

// 获取登录状态
export const loginStatus = (params: object) => request({
    url: '/login/status',
    params
})

// 获取游客cookie
export const anonimous = (params: object) => request({
    url: '/register/anonimous',
    params
})
