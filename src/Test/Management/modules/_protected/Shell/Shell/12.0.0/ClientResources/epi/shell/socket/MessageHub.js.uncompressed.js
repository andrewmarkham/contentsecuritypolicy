define("epi/shell/socket/MessageHub", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/url",
    "dojo/Evented",
    "dojo/on",
    "./WebSocket"
], function (
    declare,
    lang,
    Url,
    Evented,
    on,
    WebSocket
) {

    return declare(null, {
        // summary:
        //      A message hub receiving and emitting push messages from the server.
        //      The underlying connection uses a web socket for the client-server communication.
        // tags: internal

        // maxConnectionAttempts: Number
        //      The maximal number of attempts to reconnect if the socket is closed
        maxConnectionAttempts: 8,

        // reconnectPause: Number
        //      The base time to wait between reconnect attempts.
        reconnectPause: 5000,

        // statusTopic: [readonly] Object
        //      A dictionary of status topics emitted by the message hub
        statusTopic: {
            // open: [readonly] String
            //      Emitted when the socket connection has been opened
            open: "/epi/socket/open",

            // error: [readonly] String
            //      Emitted when an error occurs on the socket
            error: "/epi/socket/error",

            // reconnect: [readonly] String
            //      Emitted before trying to re-establish a socket connection
            reconnect: "/epi/socket/reconnect",

            // connectionfailed: [readonly] String
            //      Emitted when a socket connection can not be established
            connectionfailed: "/epi/socket/connectionfailed",

            // message: [readonly] String
            //      Emitted when a socket message is received from the server
            message: "/epi/socket/message"
        },

        // heartBeatInterval: Number
        //      The time in ms between heartbeat messages sent to the server when idle.
        //      If set to 0 heartbeat will be disabled.
        heartbeatInterval: 3000,

        // heartbeatMessage: String
        //      The string sent as a heartbeat message to the server.
        heartbeatMessage: "/epi/heartbeat",

        _path: null,
        _eventListeners: null,
        _topicHub: null,
        _connectionAttempts: 0,
        _hasBeenConnected: false,
        _reconnectHandle: null,

        _heartbeatHandle: null,
        _outstandingHeartbeats: 0,

        constructor: function (socketPathResolver) {
            // summary:
            //      Creates a new instance of the MessageHub
            // socketPathResolver: function
            //      Callback to resolve the path to the server-side socket endpoint

            this._topicHub = new Evented();
            this._socketPathResolver = socketPathResolver;
            this._eventListeners = [];
        },

        start: function () {
            // summary:
            //      Opens the connection to the server and attaches message event listeners
            // tags: public

            var socket;

            if (this._socket && this._socket.readyState !== WebSocket.CLOSED) {
                return;
            }

            socket = new WebSocket(this._resolvePath());

            this._eventListeners.push(
                on(socket, "error", lang.hitch(this, "_onError")),
                on(socket, "open", lang.hitch(this, "_onOpen")),
                on(socket, "close", lang.hitch(this, "_onClose")),
                on(socket, "message", lang.hitch(this, "_onMessage"))
            );

            this._socket = socket;
        },

        stop: function () {
            // summary:
            //      Closes the connection to the server and removes message event listeners
            // tags: public

            if (!this._socket) {
                return;
            }

            this._reconnectHandle && clearTimeout(this._reconnectHandle);
            this._reconnectHandle = null;

            this._socket.close();
            this._socket = null;
            this._eventListeners.forEach(function (listener) {
                listener.remove();
            });
            this._eventListeners = [];
        },

        subscribe: function (topic, listener) {
            // summary:
            //      subscribe to a topic published from server
            // tags: public

            return this._topicHub.on(topic, listener);
        },

        _resolvePath: function () {
            // summary:
            //      Resolves the websocket path based on the current location
            // tags: protected

            var base = (document.baseURI || window.location.href).replace(/^http/i, "ws");

            return new Url(base, this._socketPathResolver());
        },

        _publish: function (topic, data) {
            // summary:
            //      Executes a publish on the message hub
            // tags: protected

            this._topicHub.emit(topic, data);
        },

        _onMessage: function (messageEvent) {
            // summary:
            //      Handles incoming messages from the websocket client
            // tags: private

            var data;

            if (messageEvent.data && !this._handleHeartbeat(messageEvent.data)) {
                data = JSON.parse(messageEvent.data);
                this._publish(this.statusTopic.message, data);
                if (data && data.topic) {
                    this._publish(data.topic, data.data);
                }
            }
        },

        _onError: function (e) {
            // summary:
            //      Handles error events on the websocket client
            // tags: private

            // Connection failed and closed when opening, it can't be configured right
            // make sure we get a final fail when the close event comes
            if (!this._hasBeenConnected && this._socket.readyState === WebSocket.CLOSED) {
                this._connectionAttempts = this.maxConnectionAttempts;
            }

            this._publish(this.statusTopic.error, e);
        },

        _onOpen: function (e) {
            // summary:
            //      Handles open events on the websocket client
            // tags: private

            this._hasBeenConnected = true;
            this._connectionAttempts = 0;
            this._publish(this.statusTopic.open, e);

            this._resetHeartbeat();
        },

        _onClose: function (e) {
            // summary:
            //      Handles close events on the websocket client
            // tags: private

            var nextAttempt,
                publish = function (topic) {
                    this._publish(topic, {
                        connectionAttempts: this._connectionAttempts,
                        lastAttempt: this._connectionAttempts >= this.maxConnectionAttempts,
                        hasBeenConnected: this._hasBeenConnected
                    });
                }.bind(this),
                reConnect = function () {
                    publish(this.statusTopic.reconnect);
                    this._reconnectHandle = null;
                    this.stop();
                    this.start();
                }.bind(this);

            this._heartbeatHandle && clearTimeout(this._heartbeatHandle);
            this._heartbeatHandle = null;

            if (!this._socket) {
                return;
            }

            if (!e.wasClean) {
                this._connectionAttempts++;
                publish(this.statusTopic.connectionfailed);
            }

            if (this._connectionAttempts <= this.maxConnectionAttempts) {
                nextAttempt = this.reconnectPause * Math.pow(this._connectionAttempts, 2);
                this._reconnectHandle = setTimeout(reConnect, nextAttempt);
            }
        },

        _resetHeartbeat: function () {
            // summary:
            //
            // tags: private

            var checkHeartbeat = function () {
                if (this._outstandingHeartbeats > 1) {
                    this._socket.close();
                } else {
                    this._outstandingHeartbeats++;
                    this._socket.send(this.heartbeatMessage);
                    this._heartbeatHandle = setTimeout(checkHeartbeat, this.heartbeatInterval);
                }
            }.bind(this);

            if (this.heartbeatInterval === 0) {
                return;
            }

            this._outstandingHeartbeats = 0;

            if (this._heartbeatHandle) {
                clearTimeout(this._heartbeatHandle);
                this._heartbeatHandle = setTimeout(checkHeartbeat, this.heartbeatInterval);
            } else {
                checkHeartbeat();
            }
        },

        _handleHeartbeat: function (data) {
            // summary:
            //
            // tags: private

            this._resetHeartbeat();

            if (data === this.heartbeatMessage) {
                return true;
            }
        }
    });
});
