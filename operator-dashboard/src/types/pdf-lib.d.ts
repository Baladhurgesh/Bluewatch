declare module 'pdf-lib' {
  export const PDFDocument: {
    create(): Promise<any>;
  };

  export function rgb(r: number, g: number, b: number): any;

  export const StandardFonts: {
    Helvetica: string;
    HelveticaBold: string;
    TimesRoman: string;
    TimesRomanBold: string;
    Courier: string;
    CourierBold: string;
  };
} 