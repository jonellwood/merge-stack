package com.jonellwood.mergestack;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        View webView = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, windowInsets) -> {
            Insets systemBars = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            ViewGroup.MarginLayoutParams layoutParams =
                    (ViewGroup.MarginLayoutParams) view.getLayoutParams();

            if (layoutParams.leftMargin != systemBars.left
                    || layoutParams.topMargin != systemBars.top
                    || layoutParams.rightMargin != systemBars.right
                    || layoutParams.bottomMargin != systemBars.bottom) {
                layoutParams.setMargins(
                        systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
                view.setLayoutParams(layoutParams);
            }

            return windowInsets;
        });
        ViewCompat.requestApplyInsets(webView);
    }
}
