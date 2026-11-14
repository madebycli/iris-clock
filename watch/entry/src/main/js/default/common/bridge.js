/*
 * The link to the Iris app on the phone, over Huawei Wear Engine P2P.
 * wearengine.js comes from Huawei's Wear Engine SDK for lite wearables and is not part of this repository
 * (see README: "Building"). PHONE_PACKAGE and PHONE_FINGERPRINT must match the Iris app on the phone.
 */
import { P2pClient, Message, Builder } from './wearengine';

var PHONE_PACKAGE = 'app.iris';
/* SHA-256 fingerprint of the signing certificate of the Iris app, as Wear Engine expects it. Filled in when building. */
var PHONE_FINGERPRINT = '';

var client = null;
var listener = null;

function ensure() {
    if (client === null) {
        client = new P2pClient();
        client.setPeerPkgName(PHONE_PACKAGE);
        if (PHONE_FINGERPRINT !== '') {
            client.setPeerFingerPrint(PHONE_FINGERPRINT);
        }
    }
    return client;
}

/* Sends one message object. onDone(ok) is called once. */
export function send(obj, onDone) {
    var text = JSON.stringify(obj);
    var builder = new Builder();
    builder.setDescription(text);
    var message = new Message();
    message.builder = builder;
    var done = false;
    ensure().send(message, {
        onSuccess: function () { if (!done) { done = true; if (onDone) { onDone(true); } } },
        onFailure: function () { if (!done) { done = true; if (onDone) { onDone(false); } } },
        onSendResult: function () {},
        onSendProgress: function () {}
    });
}

/* Calls handler(obj) for every message from the phone. One listener at a time: the page that is shown. */
export function receive(handler) {
    listener = handler;
    ensure().registerReceiver({
        onSuccess: function () {},
        onFailure: function () {},
        onReceiveMessage: function (data) {
            if (listener === null || data === undefined || data === null) { return; }
            try {
                var obj = typeof data === 'string' ? JSON.parse(data) : (data.isFileType ? null : JSON.parse(data.description || data));
                if (obj !== null && obj.t) { listener(obj); }
            } catch (e) { /* not ours */ }
        }
    });
}

export function stopReceiving() {
    listener = null;
    if (client !== null) { client.unregisterReceiver({ onSuccess: function () {} }); }
}

/* Whether the Iris app is installed on the phone: done(true|false). Code 205 = installed, 204 = not installed. */
export function phoneReady(done) {
    ensure().ping({
        onSuccess: function () {},
        onFailure: function () { done(false); },
        onPingResult: function (r) { done(r && r.code === 205); }
    });
}
