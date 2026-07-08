package com.ailifeos.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            FirebaseApp.getInstance();
        } catch (IllegalStateException e) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                .setApplicationId("com.ailifeos.app")
                .setApiKey("unused")
                .setProjectId("unused")
                .build();
            FirebaseApp.initializeApp(this, options);
        }
    }
}
