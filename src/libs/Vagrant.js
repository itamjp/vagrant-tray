"use strict";
/**
 * Vagrant モジュール
 *
 * @module  {Vagrant}    Vagrant
 * @class   {Vagrant}
 */
module.exports = new (function Vagrant() {
    /**
     * 実行コンテキスト
     *
     * @type    {Function}
     */
    const self = this;

    /**
     * NodeVagrant クラス
     *
     * @type    {NodeVagrant}
     */
    const NodeVagrant = require('node-vagrant');

    /**
     * Elevator クラス
     *
     * @type    {Elevator}
     */
    const Elevator = require('elevator');

    /**
     * インスタンスデータ
     *
     * @type    {Object}
     */
    let data = {
        statuses:   {},
        length:     0,
    };

    /**
     * 更新タイミング(ミリ秒)
     *
     * @type    {Number}
     */
    const UPDATE_INTERVAL = 600000;

    /**
     * インターバルタイマー識別子
     *
     * @type    {Number}
     */
    let idInterval = 0;

    /**
     * 実行可能なコマンド
     *
     * @type    {Object}
     */
    const VALID_COMMANDS = {
        up:     true,
        halt:   true,
        reload: true,
    };

    // -------------------------------------------------------------------------
    /**
     * 読み込み実行
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     * @private
     */
    const _init = function _init() {
        _update();
        idInterval = setInterval(_update, UPDATE_INTERVAL);
        return true;
    };

    /**
     * ステータスを保存する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    const _updateStatus = function _updateStatus(err, out) {
        // 数が違うなら変更あり
        let changed      = ( out.length !== data.length );
        let statuses     = {}
        let id           = '';
        for ( let i=0 ; i<out.length ; i++ ) {
            id           = out[i].id
            statuses[id] = out[i];
            if ( ( id in data.statuses ) === false ) {
                changed  = true;
                continue;
            }
            if (   data.statuses[id].name     !== out[i].name
                || data.statuses[id].provider !== out[i].provider
                || data.statuses[id].state    !== out[i].state
                || data.statuses[id].cwd      !== out[i].cwd ) {
                changed  = true;
                continue;
            }
        }
        data.statuses = statuses;
        data.length   = out.length;
        if ( changed === true ) {
            _updateTrayIcon();
        }
        return true;
    };

    /**
     * ステータスを更新する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    const _update = function _update() {
        NodeVagrant.globalStatus(_updateStatus);
        return true;
    };

    /**
     * ステータスを更新する
     *
     * @type    {Function}
     * @method
     * @return  {Boolean}   true
     */
    self.updateStatus = function update() {
        return _update();
    };

    /**
     * ステータスを取得する
     *
     * @type    {Function}
     * @method
     * @param   {String}    id
     * @return  {Boolean}   true
     */
    self.getStatus = function getStatus(id) {
        id = '' + (id||'');
        if ( id in data.statuses ) {
            return data.statuses[id];
        }
        return {id: id};
    };

    /**
     * ステータスを取得する
     *
     * @type    {Function}
     * @method
     * @param   {String}    id
     * @return  {Boolean}   true
     */
    self.list = function list() {
        let ids = [];
        for ( let id in data.statuses ) {
            ids.push(id);
        }
        return ids;
    };

    /**
     * ステータスを取得する
     *
     * @type    {Function}
     * @method
     * @param   {String}    id
     * @return  {Boolean}   true
     */
    const _updateTrayIcon = function _updateTrayIcon() {
        $IF.get('./libs/TrayIcon.js').update();
        return ids;
    };

    /**
     * コマンドを実行する
     *
     * @type    {Function}
     * @method
     * @param   {String}    cmd
     * @param   {String}    id
     * @return  {Boolean}   true
     */
    const _run = function _run(cmd, id) {
        const commands = ['vagrant', cmd, id];
        Log.info("Execute with elevation ['" + commands.join("' '") + "']");
        Elevator.executeSync(commands, {waitForTermination: true});
        _update();
        return response.status;
    };

    /**
     * コマンドを実行する
     *
     * @type    {Function}
     * @method
     * @param   {String}    cmd
     * @param   {String}    id
     * @return  {Boolean}   true
     */
    self.run = function run(cmd, id) {
        if ( VALID_COMMANDS[cmd] !== true ) {
            alert("Vagrant can't run '" + cmd + "'.", 'Error', 'error');
            return false;
        }
        return _run(cmd, id);
    };

    // -------------------------------------------------------------------------
    _init();
    return self;
})();
