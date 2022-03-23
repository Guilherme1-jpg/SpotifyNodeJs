import fs from "fs";
import config from "./config.js";
import { randomUUID } from "crypto";
import { extname, join } from "path";
import { PassThrough } from "stream";
import fsPromises from "fs/promises";
import Throttle from "throttle";
import { childProcess } from "child_process";
import { logger } from "./util.js";
import streamsPromises from "stream/promises";
const {
  dir: { publicDirectory },
  constants: { fallbackBitRate, englishConversation, bitRateDivisor },
} = config;

export class Service {
  constructor() {
    this.clienStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitRate = 0;
    this.ThrottleTransform = {};
    this.currentReadable = {};
  }
  //cliente recebe objeto
  createClientStream() {
    const id = randomUUID();
    const clienStreams = new PassThrough();
    this.clienStreams.set(id, clienStreams);

    return {
      id,
      clienStreams,
    };
  }

  removeClienteStream(id) {
    this.clienStreams.delete(id);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn("sox", args);
  }

  async getBitRate(song) {
    try {
      const args = ["--i", "-B", song];
      const {
        stderr, //tudo o que é errl
        stout, // tudo que é log
        stdin, //enivar dados
      } = this._executeSoxCommand(args);

      const [sucess, error] = [stout, stderr].map((stream) => stream.read());
      if (error) return await Promise.reject(error);

      return sucess.toString().trim().replace(/k/, "000");
    } catch (error) {
      logger.error(`bitRate error ${error}`);
      return fallbackBitRate;
    }
  }
  //trim remove espaço

  async startStream() {
    logger.info(`starting with ${this.currentSong}`);
    const bitRate =
      (this.currentBitRate = await this.getBitRate(this.currentSong)) /
      bitRateDivisor;
    //Controla fluxo de aplicações
    const throttleTransform = new Throttle(bitRate);

    const songReadable = (this.currentReadable = this.createFileStream(
      this.currentSong
    ));
    //ler ate o final
    streamsPromises.pipeline(songReadable, throttleTransform);
  }
  //percorre em blocos os arquivos

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    //home/index.html
    const fullFilePath = join(publicDirectory, file);
    //valida se existe o arquivo
    await fsPromises.access(fullFilePath);
    const fileType = extname(fullFilePath);
    return {
      type: fileType,
      name: fullFilePath,
    };
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);
    return { stream: this.createFileStream(name), type };
  }
}
