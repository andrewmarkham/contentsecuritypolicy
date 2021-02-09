define("epi-cms/widget/_UrlSelectorMixin", [
// Dojo
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/_base/lang",
    "dojo/when",
    // EPi Framework
    "epi",
    "epi/Url",
    // EPi CMS
    "epi-cms/core/ContentReference",
    "epi-cms/core/PermanentLinkHelper"
], function (
    // Dojo
    declare,
    Deferred,
    lang,
    when,
    // EPi Framework
    epi,
    Url,
    // EPi CMS
    ContentReference,
    PermanentLinkHelper) {

    return declare(null, {
        // tags:
        //      internal

        // _contentData: Object
        //      Content data which is related to the url value.
        _contentData: null,

        _setValueAndFireOnChange: function (value) {
            //summary:
            //    Sets the value and calls onChange if value was changed
            // tags:
            //    protected

            var isModified;
            if (this._valueChangedPromise) {
                this._valueChangedPromise.cancel("");
                this._valueChangedPromise = null;
            }

            this.set("permanentLink", null);
            this.set("previewUrl", null);

            if (!value) {

                this._updateDisplayNode(null);
                isModified = this.value !== value;
                this.value = value;
                this._contentData = null;

                if (isModified) {
                    this.onChange(value);
                }

                this._started && this.validate();

                return;
            }

            when(this._getContentByPermanentLink(value), lang.hitch(this, function (content) {
                this._updateDisplayNode(content);

                // We need to recreate the internal format before saving the data.
                var urlFormatValue = content.permanentLink;
                this._started && this.validate();

                isModified = !epi.areEqual(this.value, urlFormatValue);
                this.value = urlFormatValue;

                if (isModified) {
                    this.onChange(urlFormatValue);
                }

                if (content) {
                    this.set("permanentLink", content.permanentLink);
                    this.set("previewUrl", content.previewUrl);
                }

            }));
        },

        _convertValueToContentReference: function (value) {
            // summary:
            //      Creates a ContentReference from the internal value.
            // tags:
            //      protected

            if (this._contentData) {
                return new ContentReference(this._contentData.contentLink);
            }

            return null;
        },

        _getContentByPermanentLink: function (/*String*/value) {
            // summary:
            //      Get content which is related to the permanent link value.
            // tags:
            //      protected

            if (epi.areEqual(this.value, value) && this._contentData) {
                return this._contentData;
            }

            this._valueChangedPromise = new Deferred();
            when(PermanentLinkHelper.getContent(value, { allLanguages: true }), lang.hitch(this, function (content) {
                this._contentData = content;
                if (this._valueChangedPromise) {
                    this._valueChangedPromise.resolve(content);
                }
            }));

            return this._valueChangedPromise.promise;
        }
    });
});
