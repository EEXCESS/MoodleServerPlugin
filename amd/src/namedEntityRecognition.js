/**
 * A module to query the EEXCESS named entitiy recognition and disambiguation service.
 * 
 * @module c4/namedEntityRecognition
 */

/**
 * Callback for the entitiesAndCategories function
 * @callback namedEntityRecognition~onResponse
 * @param {String} status Indicates the status of the request, either "success" or "error". 
 * @param {Object} data Contains the response data. In the case of an error, it is the error message and in the case of success, it is the response returned from the named entity recognition service. TODO: add link to documentation
 */

define(['jquery'], function($) {
    var endpoint = 'https://eexcess.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/recognizeEntity';
    var xhr;

    return {
        /**
         * Retrieves named entities and associated categories for a set of paragraphs.
         * @param {Array<{id:String,headline:String,content:String}>} paragraphs The paragraphs to annotate.
         * @param {namedEntityRecognition~onResponse} callback Callback function called on success or error.
         */
        entitiesAndCategories: function(paragraphs, callback) {
            if (xhr && xhr.readyState !== 4) {
                xhr.abort();
            }
            xhr = $.ajax({
                url: endpoint,
                data: JSON.stringify(paragraphs),
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                timeout:10000
            });
            xhr.done(function(response) {
                if (typeof callback !== 'undefined') {
                    callback({status: 'success', data: response});
                }
            });
            xhr.fail(function(jqXHR, textStatus, errorThrown) {
                if (textStatus !== 'abort') {
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                    if (typeof callback !== 'undefined') {
                        callback({status: 'error', data: textStatus});
                    }
                }
            });
        }
    };
});