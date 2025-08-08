import { Component, Input } from "@angular/core";

@Component({
  selector: "app-modal-message",
  templateUrl: "./modal-message.component.html",
  styleUrls: ["./modal-message.component.css"],
})
export class ModalMessageComponent {
  @Input() type: "success" | "error" = "success";
  @Input() message: string = "";
  @Input() onClose: () => void;

  close() {
    if (this.onClose) this.onClose();
  }
}
