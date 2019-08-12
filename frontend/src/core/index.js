import Auth from './Auth';
import { EventEmitter } from 'events';
import axios from 'axios';
import { connect } from 'mqtt';

class WebCore extends EventEmitter {
  /**
   * @type Auth
   */
  auth;

  /**
   * @type AxiosInstance
   */
  axios;

  /**
   * @type MqttClient
   */
  socket;

  /**
   * Loaded modules
   */
  modules = {};

  constructor() {
    super();

    this.auth = new Auth(this);
    this.axios = axios.create({
      baseURL: process.env.REACT_APP_API_URL,
    });
  }

  /**
   * Put an authentication token to the request if exists
   *
   * @param {AxiosRequestConfig} data
   * @param {string?} token
   * @returns {Promise<AxiosResponse>}
   */
  authenticatedRequest(data, token) {
    return this.axios.request({
      ...data,
      headers: {
        Authorization: token || this.auth.getToken(),
        ...data.headers,
      },
    });
  }

  /**
   * Connecto to the MQTT WebSocket
   */
  connect() {
    if (!this.auth.isAuthenticated()) {
      console.error('Connect requires authentication');
      return false;
    }

    if (this.socket) {
      this.socket.reconnect();
    } else {
      const clientId = this.auth.userData.id + '@' + (Date.now() / 1000 | 0); // https://stackoverflow.com/a/221297/4009260

      this.socket = connect(process.env.REACT_APP_MQTT_URL, {
        clientId,
        username: 'user',
        password: this.auth.userData.token,
      });

      this.socket.on('connect', () => this.emit('connect'));
      this.socket.on('offline', () => this.emit('disconnect'));
      this.socket.on('disconnect', () => this.emit('disconnect'));
      this.socket.on('close', () => this.emit('disconnect'));

      this.socket.on('message',(topic, message) => {
        try {
          const data = JSON.parse(message.toString());

          console.log('Socket json:', topic, data);

          this.emit(`topic-${topic}`, data);
        } catch (e) {
          console.log('Socket: ', message, e);

          this.emit('message', message, topic);
        }
      });
    }
  }

  /**
   * Disconnect from mqtt websocket
   * @param force
   * @returns {Promise<boolean>}
   */
  disconnect(force = false) {
    return new Promise(resolve => this.socket.end(force, resolve));
  }

  /**
   * @param {string} topic
   * @param callback
   */
  subscribe(topic, callback) {
    this.socket.subscribe(topic);

    this.on(`topic-${topic}`, callback);
  }

  /**
   * @param {string} topic
   * @param callback
   */
  unsubscribe(topic, callback) {
    this.socket.unsubscribe(topic);

    this.removeListener(`topic-${topic}`, callback);
  }

  /**
   * @param {Object<id,...rest>[]} modules
   */
  async loadModules(modules) {
    const newModules = modules.filter(config => !this.modules.hasOwnProperty(config.id));

    const modulesComponents = await Promise.all(newModules.map((config) => {
      if (config.local) {
        return import(`../modules/${config.id}`);
      }

      return import(`${config.id}`);
    }));

    modulesComponents.forEach((Component, index) => {
      const moduleConfig = modules[index];

      this.modules[moduleConfig.id] = Component;
      this.modules[moduleConfig.id].config = moduleConfig;
    });
  }
}

export default new WebCore();
