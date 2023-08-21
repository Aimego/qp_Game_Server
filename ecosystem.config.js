module.exports = {
  apps : [{
    cwd: '/www/wwwroot/mjServer/mjgame_server', // 项目的目录位置(http服务)
    kill_timeout: 10000,
    wait_ready: true,
    watch: false, // 是否监听文件改动，而重新启动服务
    ignore_watch: ['node_modules'], // 忽略监听的目录
    name   : "mjgame_http", // 启动项目的别名
    port: 9000,
    script : "./app.ts" // 项目的启动文件
  },{
    cwd: '/www/wwwroot/mjServer/mjgame_server', // 项目的目录位置(websocket服务)
    kill_timeout: 10000,
    wait_ready: true,
    watch: false, // 是否监听文件改动，而重新启动服务
    ignore_watch: ['node_modules'], // 忽略监听的目录
    name   : "mjgame_socket", // 启动项目的别名
    port: 9001,
    script : "./socket/index.ts" // 项目的启动文件
  }]
}
