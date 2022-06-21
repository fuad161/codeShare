app.tabs.cjDropShipping = function () {
    this.text = $.i18n.prop("cjDropShipping");
    this.tip = $.i18n.prop("manage.cjDropShipping");
    this.ui_class = "cjDropShipping";
    this.ajax_url = app.baseUrl + "cjDropShipping/loadAppView";
    this.tab_objs = {}
    app.tabs.cjDropShipping._super.constructor.apply(this, arguments);
};

var _cjds = app.tabs.cjDropShipping.inherit(app.MultiTab);

_cjds.onContentLoad = function (data) {
    var index = data.index.capitalize();
    if (this["init" + index + "Settings"]) {
        this["init" + index + "Settings"](data);
    }
    data.panel.find("form").form({
        ajax: {
            success: function () {
                data.panel.clearDirty();
                if(data.success) {
                    data.success()
                }
            }
        }
    });
}

var _s = app.tabs.setting.prototype;

(function() {
    function convertFormToJSON(form) {
        const array = $(form).serializeArray();
        const data = {};
        $.each(array, function () {
            data[this.name] = this.value || "";
        });
        return data;
    }
    function saveConfigurations(data) {
        let authorize_url = app.baseUrl + "cjDropShipping/saveConfigurations";
        bm.ajax({
            url: authorize_url,
            data: data,
            success: function () {

            },
        });
    }

    function authorizeCJDropShipping(panel){
        let invoker = $(this),
            authorize_url = app.baseUrl + "cjDropShipping/authorizeCj",
            f_data = convertFormToJSON(panel.find(".authorize-form"));
        bm.ajax({
            url: authorize_url,
            data: f_data,
            success: function () {
                panel.clearDirty();
                f_data['cjDropShipping.authorization'] = true;
                saveConfigurations(f_data);
                panel.find("[name='cjDropShipping.authorization']").val('true')
                panel.reload(true);
            },
            error: function (){
                f_data['cjDropShipping.authorization'] = false;
                saveConfigurations(f_data);
                panel.find("[name='cjDropShipping.authorization']").val('false');
                panel.clearDirty();
            },
        });
    }
    function importFromCjDropShipping(panel) {
        var importFields = panel.find(".import");
        var importItems = []
        importFields.each(function () {
            if (this.jqObject.prop("checked")) {
                importItems.push(this.jqObject.attr("importType"))
            }
        });
        if (importItems.length) {
            panelContentTabLoader(true, panel)
            bm.ajax({
                url: app.baseUrl + "cjDropShipping/importData",
                data: {importItems: JSON.stringify(importItems)},
                success: function () {
                    panel.clearDirty()
                    panel.reload(true)
                },
                error: function (resp) {
                    panel.clearDirty()
                    panelContentTabLoader(false, panel)
                    console.log(resp)
                }
            });
        } else {
            bm.notify($.i18n.prop("please.select.import.item"), "alert");
        }
    }

    _s.initCjDropShippingConfigSettings = function (data) {
        data.panel.find(".authorize").on("click", function (e){
            authorizeCJDropShipping(data.panel);
        });
        data.panel.find(".cj-drop-shipping-config-modify-button").on("click", function (){
            data.panel.find(".authorization-status").hide();
            data.panel.find(".authorize").show();
            data.panel.find(".cj-disable").removeAttr("disabled");
            data.panel.find(".cj-drop-shipping-config-modify-button").hide();
            data.panel.find("[name='cjDropShipping.authorization']").val('false');
        });
        data.panel.find(".import-from-cj-drop-shipping").on("click", function () {
            importFromCjDropShipping(data.panel);
        });
        data.panel.find('[importType="importProduct"]').on("change", function (){
            if (this.jqObject.is(":checked")) {
                data.panel.find('[importType="importProductCategory"]').prop("checked", true);
            }
        });
        if(convertFormToJSON(data.panel.find(".authorize-form"))['cjDropShipping.authorization']==='true'){
            data.panel.find(".authorization-status").show();
            data.panel.find(".authorize").hide();
            data.panel.find(".cj-disable").attr("disabled", '');
            data.panel.find(".cj-drop-shipping-config-modify-button").show();
        }
        panelContentTabLoader(false, data.panel)
    }

    panelContentTabLoader = function (isLoader, panel){
        panel.closest(".content-tabs-container").loader(isLoader);
    };

}());