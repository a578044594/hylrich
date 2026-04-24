declare module 'grpc' {
  interface ServiceServerImplementation {
    [methodName: string]: (call: any, callback?: (err: Error | null, response?: any) => void) => void;
  }

  interface ServerDuplexStream<RequestType, ResponseType> {
    write: (message: ResponseType) => void;
    cancel: () => void;
    on(event: string, handler: (message: any) => void): this;
  }
}

declare module '@grpc/grpc-js' {
  import * as grpc from 'grpc';
  export = grpc;
}
