// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package    block_eexcess
 * @copyright  bit media e-solutions GmbH <gerhard.doppler@bitmedia.cc>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery', 'block_eexcess/APIconnector', 'block_eexcess/iframes', 'block_eexcess/md5','block_eexcess/paragraphDetection'], function ($, api, iframes, md5, pDet) {
    // TODO
    // create HTML elements to hold realuts
    // render results after query response.
    var attoEditor = false;
    function createUserID(clientType, userName) {
        return md5.getHash(clientType + userName);
    }
    var showBar = undefined;
    var hideBar = undefined;
    var interestsText = undefined;
    var userId = undefined;
    var baseUrl = undefined;
    var apiSettings = {};
    var origin = {
        module: "EEXCESS - Moodle Plugin searchBar",
        clientType: "EEXCESS - Moodle Plugin",
        clientVersion: "1.0",
        userID: "undefined"
    };

    // HTML elements.
    var searchBardiv = $('<div class = "search-bar-div">'),
        searchBariframe = $('<iframe>'),
        searchBariframeurl = "",
        searchBarHeight,
        profile = null;

    // Methods.
    var m = {
        // PUBLIC METHODS.
        init: function (userid, rec_base_url, interests, status_bar, showbar, hidebar) { // plugin initializer.
            showBar = showbar;
            hideBar = hidebar;
            interestsText = interests;
            userId = userid;
            origin.userID = createUserID(origin.clientType, userId);
            api.init({origin:origin});
            baseUrl = rec_base_url;
            searchBariframeurl = "https://rawgit.com/megamuf/c4-for-moodle-plugin/master/examples/searchBar_Paragraphs/index.html";
            m._bindControls();
            m._createUI();
            if(status_bar === 1){
                $('.search-bar-div').addClass('active');
            }
        },

        // PRIVATE METHODS.
        _createUI: function () {
            searchBardiv.appendTo($('body'));
            searchBardiv.append(searchBariframe);
            searchBariframe.attr('src',searchBariframeurl);
            searchBariframe.attr('class','search-bar');
        },
        _bindControls: function () { // Self explanatory.

            $('body').on('mouseup', function (e) {
                var elm = $(e.target);
                // Check if selection event is triggered.
                var isEditor = (elm.parents('.editor_atto_content').length || elm.hasClass('editor_atto_content'));
                var text = m._getSelectionText();
                if (text && text.length > 3 && !isEditor) {
                    m._query(text);
                }
            });
            $('.show-hide-bar').on('click', function(){
                var status;
                if($('.search-bar-div').hasClass('active')){
                    $('.search-bar-div').removeClass('active');
                    status = false;
                    $(this).text(showBar);
                }
                else{
                    $('.search-bar-div').addClass('active');
                    status = true;
                    $(this).text(hideBar);
                }
                $.ajax({
                    url: M.cfg.wwwroot + "/blocks/eexcess/search_bar_status.php",
                    type: "POST",
                    data:{
                        status:status
                    }
                });
            });

            window.addEventListener('message', function (e) {
                if (e.data.event) {
                    if(e.data.data){
                        e.data.data.origin = origin;
                    }

                    if (e.data.event === 'eexcess.paragraphEnd') {
                        m._query(e.data.text);
                    } else if (e.data.event === 'eexcess.newSelection') {

                    } else if (e.data.event === 'eexcess.queryTriggered') {

                    } else if(e.data.event === 'attoEditorOpened'){
                        iframes.sendMsgAll({event:'attoEditorOpened',data:""});
                        attoEditor = true;

                    } else if (e.data.event === 'eexcess.error') {

                    } else if(e.data.event === 'eexcess.searchBarhei'){
                        searchBarHeight = e.data.data;
                        if(searchBardiv[0].clientHeight == 600){
                            searchBardiv.css('height','600px');
                            if(attoEditor){iframes.sendMsgAll({event:'attoEditorOpened',data:""});}
                        }
                        else{
                            searchBardiv.css('height',searchBarHeight + 'px');
                            if(attoEditor){iframes.sendMsgAll({event:'attoEditorOpened',data:""});}
                        }

                    } else if(e.data.event === 'eexcess.openResultsBar'){
                        searchBardiv.css('height','600px');

                    } else if(e.data.event === 'eexcess.closeResultsBar'){
                        searchBardiv.css('height',searchBarHeight + 'px');

                    } else if(e.data.event === 'dashboardOpened'){
                        if(attoEditor){
                             iframes.sendMsgAll({event:'attoEditorOpened',data:""});
                             iframes.sendMsgAll({
                                    event: 'eexcess.newDashboardSettings',
                                    settings: {
                                        selectedChart: 'timeline',
                                        hideCollections: false,
                                        showLinkImageButton: true,
                                        showLinkItemButton: true,
                                        showScreenshotButton: true,
                                        origin: origin
                                    }
                                });
                        } else {
                             iframes.sendMsgAll({
                                    event: 'eexcess.newDashboardSettings',
                                    settings: {
                                        selectedChart: 'timeline',
                                        hideCollections: false,
                                        showLinkImageButton: false,
                                        showLinkItemButton: false,
                                        showScreenshotButton: false,
                                        origin: origin
                                    }
                                });
                        }

                    } else if(e.data.event === 'facetScapeOpened'){
                        if(attoEditor){
                            iframes.sendMsgAll({event:'attoEditorOpened',data:""});
                        }

                    } else if(e.data.event === 'searchBarOpened'){
                        iframes.sendMsgAll({event:'interests',data:interestsText});
                        apiSettings.origin = origin;
                        apiSettings.baseUrl = baseUrl;
                        iframes.sendMsgAll({event:'apiSettings',data:apiSettings});

                    } else if (e.data.event === 'eexcess.rating') {

                    } else if(e.data.event === 'eexcess.linkItemClicked'){

                    } else if(e.data.event === 'eexcess.log.itemCitedAsImage'){
                        api.sendLog(api.logInteractionType.itemCitedAsImage, e.data.data, function(r) { window.console.log(r);});
                    } else if(e.data.event === 'eexcess.log.itemCitedAsText'){
                        api.sendLog(api.logInteractionType.itemCitedAsText, e.data.data, function(r) { window.console.log(r);});
                    } else if(e.data.event === 'eexcess.log.itemCitedAsHyperlink'){
                        api.sendLog(api.logInteractionType.itemCitedAsHyperlink, e.data.data, function(r) { window.console.log(r);});
                    }
                }
            });
        },
        _query: function (txt) { // Query api with currently selected text.
            pDet.paragraphToQuery(txt,function(r){
                if(r.query && r.query.contextKeywords.length > 0 ){
                     profile = {
                            contextKeywords: r.query.contextKeywords
                    };
                }else{
                       profile = {
                            contextKeywords: [{
                                text: txt,
                                weight: 1.0
                            }]
                    };
                }

                profile.origin = origin;
                iframes.sendMsgAll({
                    event: 'eexcess.queryTriggered',
                    data: profile
                });

            });
        },
        _getSelectionText: function () { // Returns currently selected text.
            var text = "";
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.type != "Control") {
                text = document.selection.createRange().text;
            }
            return text;
        }
    };

    return {
        init: m.init
    };
});