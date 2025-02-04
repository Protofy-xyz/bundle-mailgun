/*

app is an express object, you can use app.get/app.post to create new endpoints
you can define newendpoints like:

app.get('/api/v1/testapi', handler(async (req, res, session, next) => {
    //you code goes here
    //reply with res.send(...)
}))

the session argument is a session object, with the following shape:
{
    user: { admin: boolean, id: string, type: string },
    token: string,
    loggedIn: boolean
}

use the chat if in doubt
*/


import { handler } from 'protolib/api'
import {Protofy} from 'protolib/base'
import { Application } from 'express';
import { getLogger } from "protolib/base"

const logger = getLogger()

Protofy("type", "CustomAPI")

export default (app, {devicePub, deviceSub, mqtt}) => {
    //PUT YOUR API HERE
    //devicePub function allows to communicate with devices via mqtt
    //deviceSub allows to receive notifications from devices via mqtt
    //app is a normal expressjs object
    //mqtt is a mqttclient connection
}


