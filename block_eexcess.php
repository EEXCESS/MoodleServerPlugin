<?php
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
 * EEXCESS block.
 *
 * @package    block_eexcess
 * @copyright  bit media e-solutions GmbH <gerhard.doppler@bitmedia.cc>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
/**
 * The EEXCESS plugin block class
 *
 * @copyright  bit media e-solutions GmbH <gerhard.doppler@bitmedia.cc>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_eexcess extends block_base {
    /**
     * Set the initial properties for the block
     */
    public function init() {
        $this->title = get_string('pluginname', 'block_eexcess');
    }
    /**
     * Allow the block to have a configuration page
     *
     * @return boolean
     */
    public function has_config() {
        return true;
    }
    /**
     * Set the applicable formats for this block to all
     *
     * @return array
     */
    public function applicable_formats() {
        return array('all' => true);
    }
    /**
     * Gets the content for this block
     *
     * @return object $this->content
     */
    public function get_content() {
        global $PAGE, $DB, $USER, $SESSION;
        if ($this->content !== null) {
            return $this->content;
        }
        if(!isset($SESSION->search_bar_status)){
            $SESSION->search_bar_status = 0;
        }
        // Titles.
        $intereststitle = get_string('interests', 'block_eexcess');
        $citationtitle = get_string('citation', 'block_eexcess');
        $imglicensetitle = get_string('imagelicense', 'block_eexcess');
        if($SESSION->search_bar_status === 1){
            $showhidebartitle = get_string('hidebar', 'block_eexcess');
        }else{
            $showhidebartitle = get_string('showbar', 'block_eexcess');
        }
        $showbar = get_string('showbar', 'block_eexcess');
        $hidebar = get_string('hidebar', 'block_eexcess');

        // New moodle urls.
        $urlinterests = new moodle_url('/blocks/eexcess/eexcess_interests.php');
        $urlcitation = new moodle_url('/blocks/eexcess/eexcess_citation.php');
        $urlimglicense = new moodle_url('/blocks/eexcess/eexcess_image_license.php');

        // HTML elements.
        $interests = "<li><img><a href = '$urlinterests'>$intereststitle</a></li>";
        $citation = "<li><a href = '$urlcitation'>$citationtitle</a></li>";
        $imglicense = "<li><a href = '$urlimglicense'>$imglicensetitle</a></li>";
        $showhidebar = "<li><button class = 'show-hide-bar'>$showhidebartitle</button></li>";
        $html = "<ul class = 'eexcess-settings'>$interests $citation $imglicense $showhidebar</ul>";

        // Params for js.
        $tablename = "block_eexcess_interests";
        $userid = $USER->id;
        $cats = $DB->get_records($tablename, array("userid" => $userid, "active" => true));
        $interestsarr = array();
        foreach ($cats as $cat) {
            $interestsarr[] = array("text" => $cat->interests);
        }

        $baseurl = get_config('block_eexcess', 'base_url');
        
        $params = array('userid' => $userid, 'rec_base_url' => $baseurl, "interests" => $interestsarr,
        "status_bar" => $SESSION->search_bar_status, "showbar" => $showbar, "hidebar" =>$hidebar);
        $PAGE->requires->js_call_amd('block_eexcess/EEXCESSResults', 'init', $params);

        // HTML content.
        $this->content         = new stdClass;
        $this->content->text   = $html;

        return $this->content;
    }
}