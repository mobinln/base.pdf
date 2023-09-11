import html2canvas from "html2canvas";
import jsPDF, { jsPDFOptions } from "jspdf";
import autoTable from "jspdf-autotable";

type marginType = { top?: number; right?: number; bottom?: number; left?: number };

export default class PDF {
  public jspdf_instance: jsPDF;
  public cursor: { x: number; y: number } = { x: 5, y: 5 };

  constructor(options?: jsPDFOptions & { cursor?: { x: number; y: number } }) {
    this.jspdf_instance = new jsPDF(options);
    if (options?.cursor) {
      this.cursor = options.cursor;
    }
  }

  private fits_in_page(height: number) {
    return this.cursor.y + height <= this.get_page_dimensions().height;
  }

  private paginate({
    height,
    marginTop,
    onAfterAddPage,
  }: {
    height: number;
    marginTop?: number;
    onAfterAddPage?: () => void;
  }) {
    if (!this.fits_in_page(height)) {
      this.jspdf_instance.addPage();
      if (onAfterAddPage) {
        onAfterAddPage();
      }
      this.cursor.y = marginTop || 0;
      return true;
    }

    return false;
  }

  public get_page_dimensions() {
    const width = this.jspdf_instance.internal.pageSize.width || this.jspdf_instance.internal.pageSize.getWidth();
    const height = this.jspdf_instance.internal.pageSize.height || this.jspdf_instance.internal.pageSize.getHeight();

    return { width, height };
  }

  public async take_snapshot(element: HTMLElement | Element, options?: { width?: number; height?: number }) {
    const canvas = await html2canvas(element as HTMLElement, {
      allowTaint: true,
      useCORS: true,
      ...options,
    });

    return { data: canvas.toDataURL("image/jpeg", 1.0), height: canvas.height, width: canvas.width };
  }

  public async add_element({
    element,
    ...other
  }: {
    element: HTMLElement | Element;
    width?: number;
    height?: number;
    margin?: marginType;
  }) {
    const { data, height, width } = await this.take_snapshot(element, { ...other });

    const imageWidth = this.get_page_dimensions().width - 10;
    const imageHeight = (height * imageWidth) / width;

    this.paginate({
      height: imageHeight + (other.margin?.top || 0),
      marginTop: 0,
    });

    this.jspdf_instance.addImage(
      data,
      "JPEG",
      this.cursor.x + (other.margin?.left || 0),
      this.cursor.y + (other.margin?.top || 0),
      imageWidth,
      imageHeight
    );
    this.cursor.y += imageHeight + (other.margin?.top || 0);
  }

  public async add_list(children: HTMLCollection) {
    for (const element of children) {
      await this.add_element({ element });
    }
  }

  public add_table({ html, marginTop }: { html: HTMLTableElement; marginTop?: number }) {
    autoTable(this.jspdf_instance, {
      html,
      startY: this.cursor.y + (marginTop || 0),
    });
  }

  public add_image(
    imageData: string | HTMLImageElement | HTMLCanvasElement | Uint8Array,
    format: "image/png" | "image/jpg" | "image/jpeg",
    width: number,
    height: number
  ) {
    this.jspdf_instance.addImage(imageData, format, this.cursor.x, this.cursor.y, width, height);
    this.cursor.y += height;
  }

  public add_text(
    text: string,
    {
      margin = { top: 10, bottom: 0, right: 10 },
      lineSpacing = 10,
      textWidth,
      fontSize,
      onAfterAddPage,
    }: {
      margin?: marginType;
      textWidth?: number;
      fontSize?: number;
      lineSpacing?: number;
      onAfterAddPage?: () => void;
    } = { lineSpacing: 10, margin: { top: 10, bottom: 0, right: 10 } }
  ) {
    if (fontSize) {
      this.jspdf_instance.setFontSize(fontSize);
    }
    const textLines = this.jspdf_instance.splitTextToSize(
      text,
      textWidth || this.get_page_dimensions().width - (margin.right || 0)
    );

    textLines.forEach((lineText: string) => {
      this.paginate({ height: margin.bottom || 0, marginTop: margin.top, onAfterAddPage });
      this.jspdf_instance.text(lineText, this.cursor.x, this.cursor.y, { align: "justify", maxWidth: textWidth });
      this.cursor.y += lineSpacing || 0;
    });
  }

  public generate(save?: boolean) {
    if (save) {
      this.jspdf_instance.save();
    }

    return this.jspdf_instance.output("dataurlnewwindow");
  }
}
