import {Observable} from "rxjs";

export class FileHelper {
  public static fileReader(file: File): Observable<string> {

    return new Observable((observer) => {
      const reader: FileReader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (typeof e.target!.result === 'string') observer.next(e.target!.result as string);
        else if (e.target!.result instanceof ArrayBuffer) observer.next(new TextDecoder().decode(e.target!.result));
      }
      reader.onerror = () => observer.error()
      reader.onloadend = () => observer.complete();
    })
  }

  public static Base64ToPDF(base64: string, name: string): File {
    const binaryData = atob(base64);
    const array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([array], {type: 'application/pdf'});
    return new File([blob], name, {type: 'application/pdf'});
  }

  public static Base64ToFile(base64: string, name: string, mimeType: string): File {
    const binaryData = atob(base64);
    const array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([array], {type: mimeType});
    return new File([blob], name, {type: mimeType});
  }

  public static Base64ToImage(base64: string, name: string, mimeType?: string): File {
    const binaryData = atob(base64);
    const array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i);
    }

    const blob = new Blob([array], {type: mimeType || 'image/png'});
    return new File([blob], name, {type: mimeType || 'image/png'});
  }

  public static GetBase64MimeType(base64: string): string {
    const result = base64.match(/^data:(.*);base64,/);
    return result ? result[1] : '';
  }

  public static DownloadFile(file: Blob, name: string): void {
    const url = window.URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

}
