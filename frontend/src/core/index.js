import Auth from './Auth';
import { EventEmitter } from 'events';
import axios from 'axios';
import mqtt from 'mqtt';

class Core extends EventEmitter {
  /**
   * @type Auth
   */
  auth = null;

  /**
   * @type AxiosInstance
   */
  axios = null;

  /**
   * @type MqttClient
   */
  socket;

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

  connect() {
    if (!this.auth.isAuthenticated()) {
      console.error('Connect requires authentication');
      return false;
    }

    if (this.socket) {
      this.socket.reconnect();
    } else {
      const clientId = this.auth.userData.id + '@' + (Date.now() / 1000 | 0);

      this.socket = mqtt.connect(process.env.REACT_APP_MQTT_URL, {
        clientId,
        username: 'user',
        password: this.auth.userData.token,
      });
    }
  }

  disconnect(force = false) {
    return new Promise(res => this.socket.end(force, res));
  }
}

export default new Core();