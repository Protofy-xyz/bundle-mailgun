import CustomAPI from './custom/apis'
import MailgunAPI from './mailgun/apis'

export default (app, context) => {
    CustomAPI(app, context)
    MailgunAPI(app, context)
}