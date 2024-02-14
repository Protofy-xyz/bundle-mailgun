import {Protofy} from 'protolib/base'
import mailgunApi from './mailgun';

const autoApis = Protofy("apis", {
    mailgun: mailgunApi
})

export default (app, context) => {
    Object.keys(autoApis).forEach((k) => {
        autoApis[k](app, context)
    })
}