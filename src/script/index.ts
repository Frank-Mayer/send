import { Downloader } from "./Downloader";
import { Uploader } from "./Uploader";

export const app = {} as any;

try {
  const downloader = Downloader.try(location.pathname);
  downloader.then((downloader) => {
    if (downloader) {
      app.downloader = downloader;
    } else {
      history.replaceState(null, null, "/");
      app.uploader = new Uploader();
    }
  });
} catch (err) {
  console.error(err);
}
