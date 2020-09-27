<template>
  <div ref="terminal"></div>
</template>

<script>
import {WEBSOCKET_BASE_URL} from '../../api/config'

import "xterm/dist/xterm.css";
import "xterm/dist/addons/fullscreen/fullscreen.css";

import { Terminal } from "xterm";
import * as fit from "xterm/lib/addons/fit/fit";
import * as fullscreen from "xterm/lib/addons/fullscreen/fullscreen";
import * as webLinks from "xterm/lib/addons/webLinks/webLinks";
import * as attach from "xterm/lib/addons/attach/attach";

export default {
  created() {
    if (this.$route.query.id == '') {
        console.log("为空")
        return
    }
    
    let id = parseInt(this.$route.query.id)

    Terminal.applyAddon(attach);
    Terminal.applyAddon(fit);
    Terminal.applyAddon(fullscreen);
    Terminal.applyAddon(webLinks);


    const terminal = new Terminal();
    const ws = new WebSocket(WEBSOCKET_BASE_URL + id + "&workdir=/");
    ws.onclose = function() {
      console.log("服务器关闭了连接");
    };
    terminal.open(this.$refs.terminal);
    terminal.fit();
    terminal.toggleFullScreen();
    terminal.webLinksInit();
    terminal.attach(ws);
  }
};
</script>
