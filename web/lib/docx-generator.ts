import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import type { ContractTemplate } from '@/data/contracts/types';

const HEADING_COLOR = '1A1714';
const SECTION_NUM_COLOR = 'A8553D';
const BODY_COLOR = '1A1714';

export async function generateContractDocx(
  template: ContractTemplate,
): Promise<Blob> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: template.title,
          bold: true,
          size: 32,
          color: HEADING_COLOR,
        }),
      ],
    }),
  );

  // Divider under title
  children.push(
    new Paragraph({
      border: {
        bottom: { color: '888888', size: 6, style: BorderStyle.SINGLE, space: 1 },
      },
      spacing: { after: 240 },
    }),
  );

  for (const section of template.sections) {
    // Section heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 160 },
        children: [
          new TextRun({
            text: `${section.number}. `,
            bold: true,
            color: SECTION_NUM_COLOR,
            size: 24,
          }),
          new TextRun({
            text: section.title,
            bold: true,
            color: HEADING_COLOR,
            size: 24,
          }),
        ],
      }),
    );

    for (const block of section.blocks) {
      if (block.kind === 'paragraph') {
        children.push(
          new Paragraph({
            spacing: { after: 140, line: 320 },
            children: [
              new TextRun({ text: block.text, color: BODY_COLOR, size: 22 }),
            ],
          }),
        );
      } else if (block.kind === 'list') {
        for (const item of block.items) {
          children.push(
            new Paragraph({
              spacing: { after: 80, line: 300 },
              indent: { left: 360 },
              children: [
                new TextRun({ text: '•  ', color: SECTION_NUM_COLOR, size: 22 }),
                new TextRun({ text: item, color: BODY_COLOR, size: 22 }),
              ],
            }),
          );
        }
      } else if (block.kind === 'signatures') {
        for (const role of block.roles) {
          children.push(
            new Paragraph({
              spacing: { before: 280, after: 80 },
              children: [
                new TextRun({
                  text: `${role.label}:`,
                  bold: true,
                  color: HEADING_COLOR,
                  size: 22,
                }),
              ],
            }),
          );
          children.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: 'Firma / Signature: ____________________________________',
                  color: BODY_COLOR,
                  size: 22,
                }),
              ],
            }),
          );
          if (role.hasName) {
            children.push(
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: 'Nombre / Name: ______________________________________',
                    color: BODY_COLOR,
                    size: 22,
                  }),
                ],
              }),
            );
          }
          if (role.hasDate) {
            children.push(
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: 'Fecha / Date: ____ / ____ / ______',
                    color: BODY_COLOR,
                    size: 22,
                  }),
                ],
              }),
            );
          }
        }
      }
    }
  }

  const doc = new Document({
    creator: "JD's Property Solutions",
    title: template.title,
    description: `Contrato — ${template.title}`,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
