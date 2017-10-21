import ajax from './ajax.js'
import store from '../store.js'
import actions from '../actions/index.js'
import constant from '../constant.js'
import ws from '../websocket/index.js'

exports.checkLogin = () => {
    return new Promise(resolve => {
        var url = '/api/checkLogin'
        ajax.Post(url).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.login = (account, password) => {
    return new Promise(resolve => {
        var url = '/api/login'
        var query = 'account=' + account + '&password=' + password
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.visitorLogin = (name) => {
    return new Promise(resolve => {
        var url = '/api/visitorLogin'
        var query = 'name=' + name
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.logout = () => {
    return new Promise(resolve => {
        var url = '/api/logout'
        ajax.Post(url).then(resp => {
            resolve(resp)
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.checkMail = (mail) => {
    return new Promise(resolve => {
        var url = '/api/checkMail?mail=' + mail
        ajax.Get(url).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.checkName = (name) => {
    return new Promise(resolve => {
        var url = '/api/checkName?name=' + name
        ajax.Get(url).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.register = (mail, name, password) => {
    return new Promise(resolve => {
        var url = '/api/register'
        var query = 'mail=' + mail + '&name=' + name + '&password=' + password
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.active = (active_code) => {
    return new Promise(resolve => {
        var url = '/api/active'
        var query = 'active_code=' + active_code
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.forgetPassword = (mail) => {
    return new Promise(resolve => {
        var url = '/api/forgetPassword'
        var query = 'mail=' + mail
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.resetPassword = (mail, verifyCode, password) => {
    return new Promise(resolve => {
        var url = '/api/resetPassword'
        var query = 'mail=' + mail + '&verify_code=' + verifyCode + '&password=' + password
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.changePassword = (oldPassword, password) => {
    return new Promise(resolve => {
        var url = '/api/changePassword'
        var query = '&oldPassword=' + oldPassword + '&password=' + password
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}

exports.changeName = (name) => {
    return new Promise(resolve => {
        var url = '/api/changeName'
        var query = 'name=' + name
        ajax.Post(url, query).then(resp => {
            resolve(JSON.parse(resp))
        }).catch((err) => {
            console.error(err)
        })
    })
}