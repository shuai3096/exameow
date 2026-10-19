use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("mobile plugin error: {0}")]
    Mobile(String),
}

pub type Result<T> = std::result::Result<T, Error>;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("screenrecord")
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            {
                use tauri::plugin::PluginHandle;
                let _handle: PluginHandle<R> =
                    _api.register_android_plugin("com.exameow.screenrecord", "ScreenRecordPlugin")?;
            }
            Ok(())
        })
        .build()
}
