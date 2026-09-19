package io.github.sonagi130.hearth;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends Activity {
    private WebView web;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int REQ_FILE = 4101;
    private static final int REQ_PERMS = 4102;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        // 原生桥：暴露给网页调用的接口
        web.addJavascriptInterface(new Bridge(), "HearthBridge");

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }

            // 文件选择桥：网页里 <input type=file> 时系统弹选择器
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = cb;
                try {
                    Intent i = params.createIntent();
                    startActivityForResult(i, REQ_FILE);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });
        web.loadUrl("https://sonagi130.github.io/hearth/index.html");
        // Android 6.0+ 动态权限：进 App 就请求（相机/录音/定位），文件选择走系统选择器不需要
        if (Build.VERSION.SDK_INT >= 23) {
            try {
                requestPermissions(new String[]{
                        Manifest.permission.CAMERA,
                        Manifest.permission.RECORD_AUDIO,
                        Manifest.permission.ACCESS_FINE_LOCATION
                }, REQ_PERMS);
            } catch (Exception e) { /* 已经授权或弹不了，无所谓 */ }
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE) {
            if (filePathCallback != null) {
                Uri[] uris = (res == RESULT_OK && data != null)
                        ? WebChromeClient.FileChooserParams.parseResult(res, data) : null;
                filePathCallback.onReceiveValue(uris);
                filePathCallback = null;
            }
            return;
        }
        super.onActivityResult(req, res, data);
    }

    /** 网页可调的桥：window.HearthBridge */
    private class Bridge {
        @android.webkit.JavascriptInterface
        public String deviceInfo() {
            return Build.MANUFACTURER + " " + Build.MODEL + " / Android " + Build.VERSION.RELEASE;
        }

        @android.webkit.JavascriptInterface
        public boolean hasPermission(String name) {
            if (Manifest.permission.ACCESS_FINE_LOCATION.equals(name) || Manifest.permission.ACCESS_COARSE_LOCATION.equals(name)) {
                return checkSelfPermission(name) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }
}