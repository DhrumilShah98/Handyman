package com.example.admin.handymanapp;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    private final String HANDYMAN_URL = "YOUR_HANDYMAN_URL";
    private final static int PICK_FILE_REQUEST_CODE = 0;
    private ValueCallback<Uri[]> mFilePathCallback;
    private ProgressBar handymanPB;
    private ImageView handymanIV;
    private WebView handymanWV;
    private LinearLayout handymanProgressFaviconLL;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initFields();
        handymanWV.setWebViewClient(new WebViewClient(){

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                handymanProgressFaviconLL.setVisibility(View.VISIBLE);
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                handymanProgressFaviconLL.setVisibility(View.GONE);
                super.onPageFinished(view, url);
            }
        });
        handymanWV.setWebChromeClient(new WebChromeClient(){
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                handymanPB.setProgress(newProgress);
            }

            @Override
            public void onReceivedIcon(WebView view, Bitmap icon) {
                super.onReceivedIcon(view, icon);
                handymanIV.setImageBitmap(icon);
            }

            @Override
            public void onReceivedTitle(WebView view, String title) {
                super.onReceivedTitle(view, title);
                getSupportActionBar().setTitle(title);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                mFilePathCallback = filePathCallback;
                String[] mimeTypes = {"image/jpeg", "image/jpg", "image/png"};
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("image/*").putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);;
                startActivityForResult(intent, PICK_FILE_REQUEST_CODE);
                return true;
            }
        });
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        if (requestCode == PICK_FILE_REQUEST_CODE) {
            Uri result = data == null || resultCode != RESULT_OK ? null:data.getData();
            Uri []resultsArray = new Uri[1];
            resultsArray[0] = result;
            mFilePathCallback.onReceiveValue(resultsArray);
        }
    }
    public void initFields() {
        handymanPB = findViewById(R.id.handymanProgressBar);
        handymanIV = findViewById(R.id.handymanFaviconImageView);
        handymanWV = findViewById(R.id.handymanWebView);
        handymanWV.findNext(true);
        handymanProgressFaviconLL = findViewById(R.id.handymanProgressFaviconLL);
        handymanPB.setMax(100);
        handymanWV.loadUrl(HANDYMAN_URL);
        handymanWV.getSettings().setJavaScriptEnabled(true);
        handymanWV.getSettings().setBuiltInZoomControls(true);
        handymanWV.getSettings().setAllowFileAccess(true);
    }

    @Override
    public void onBackPressed() {
        if(handymanWV.canGoBack()){
            handymanWV.goBack();
        }else{
            finish();
        }
    }

    private void onForwardPressed() {
        if(handymanWV.canGoForward()){
            handymanWV.goForward();
        }else{
            Toast.makeText(this, "Can't go any further!", Toast.LENGTH_SHORT).show();
        }
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater menuInflater = getMenuInflater();
        menuInflater.inflate(R.menu.main_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()){
            case R.id.menu_back:
                onBackPressed();
                break;
            case R.id.menu_forward:
                onForwardPressed();
                break;
            case R.id.menu_refresh:
                handymanWV.reload();
                break;
        }
        return super.onOptionsItemSelected(item);
    }
}
