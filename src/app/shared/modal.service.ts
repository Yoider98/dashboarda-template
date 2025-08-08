import {
  Injectable,
  ComponentFactoryResolver,
  ApplicationRef,
  Injector,
} from "@angular/core";
import { ModalMessageComponent } from "./modal-message/modal-message.component";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  showModal(type: "success" | "error", message: string) {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(
        ModalMessageComponent
      );
    const componentRef = componentFactory.create(this.injector);

    componentRef.instance.type = type;
    componentRef.instance.message = message;
    componentRef.instance.onClose = () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    };

    this.appRef.attachView(componentRef.hostView);

    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  }
}
