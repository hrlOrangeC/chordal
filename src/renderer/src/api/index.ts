import { recommendSongs, songDetail, artistDetail, albumDetail, musicUrlVIP } from '../api/Home'
import { searchList, searchDefault, searchHot, suggest } from '../api/Search'
import { playlistDetail, playlistSub, playlistTrackAll } from '../api/PlayListDetail'
import { singerDeatil, singerSongs, singerAlbums, singerMVs } from '../api/SingerDetail'
import { MVDetail, MVUrl } from '../api/MVDetail'
import { userDetail, userPlayList } from '../api/UserDetail'
import { commentNew, commentFloor, commentSend, commentLike } from '../api/Comments'
import { key, QRCode, QRCheck, loginCell, capSent, account, loginStatus, logout, loginEmail, anonimous } from '../api/Login'
import { topList } from '../api/LeaderBoard'
import { userSubcount, albumSubList, artistSubList, MVSubList } from '../api/Collection'
import { newLyric } from '../api/Lyrics'
import { innerVersion } from '../api/Setting'

export const recommendSongsAPI = recommendSongs
export const songDetailAPI = songDetail
export const artistDetailAPI = artistDetail
export const albumDetailAPI = albumDetail
export const musicUrlVIPAPI = musicUrlVIP

export const searchListAPI = searchList
export const searchDefaultAPI = searchDefault
export const searchHotAPI = searchHot
export const suggestAPI = suggest

export const playlistDetailAPI = playlistDetail
export const playlistSubAPI = playlistSub
export const playlistTrackAllAPI = playlistTrackAll

export const singerDeatilAPI = singerDeatil
export const singerSongsAPI = singerSongs
export const singerAlbumsAPI = singerAlbums
export const singerMVsAPI = singerMVs

export const MVDetailAPI = MVDetail
export const MVUrlAPI = MVUrl

export const userDetailAPI = userDetail
export const userPlayListAPI = userPlayList

export const commentNewAPI = commentNew
export const commentFloorAPI = commentFloor
export const commentSendAPI = commentSend
export const commentLikeAPI = commentLike

export const keyAPI = key
export const QRCodeAPI = QRCode
export const QRCheckAPI = QRCheck
export const loginCellAPI = loginCell
export const capSentAPI = capSent
export const accountAPI = account
export const loginStatusAPI = loginStatus
export const logoutAPI = logout
export const loginEmailAPI = loginEmail
export const anonimousAPI = anonimous

export const topListAPI = topList

export const userSubcountAPI = userSubcount
export const albumSubListAPI = albumSubList
export const artistSubListAPI = artistSubList
export const MVSubListAPI = MVSubList

export const newLyricAPI = newLyric

export const innerVersionAPI = innerVersion
