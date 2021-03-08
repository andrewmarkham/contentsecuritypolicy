define([
    "tinymce/tinymce.min"
], function () {

    // Set the default settings for baseUrl and suffix since TinyMCE will calculate them based on the first script it
    // finds with the name tinymce.js (which happens to be a language file in this case).
    window.tinymce.overrideDefaults({
        base_url: require.toUrl("tinymce"),
        suffix: ".min"
    });

    // A facade that returns the TinyMCE object from the window since TinyMCE doesn't support AMD.
    return window.tinymce;
});
