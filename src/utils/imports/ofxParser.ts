import {
    normalizeImportedTransaction,
    parseBrazilianCurrency,
    type NormalizedImportedTransaction,
  } from './transactionNormalizer';
  
  function extractTag(
    content: string,
    tag: string,
  ) {
    const regex = new RegExp(
      `<${tag}>(.*?)\\n`,
      'i',
    );
  
    return content.match(regex)?.[1]?.trim();
  }
  
  function parseOfxDate(
    value: string,
  ) {
    const cleaned =
      value.substring(0, 8);
  
    const year =
      cleaned.substring(0, 4);
  
    const month =
      cleaned.substring(4, 6);
  
    const day =
      cleaned.substring(6, 8);
  
    return `${year}-${month}-${day}`;
  }
  
  export async function parseOfxTransactions(
    file: File,
  ): Promise<
    NormalizedImportedTransaction[]
  > {
    const content =
      await file.text();
  
    const transactions: NormalizedImportedTransaction[] =
      [];
  
    const blocks =
      content.split('<STMTTRN>');
  
    for (const block of blocks) {
      const amount =
        extractTag(
          block,
          'TRNAMT',
        );
  
      const date =
        extractTag(
          block,
          'DTPOSTED',
        );
  
      const description =
        extractTag(
          block,
          'MEMO',
        ) ??
        extractTag(
          block,
          'NAME',
        );
  
      if (
        !amount ||
        !date ||
        !description
      ) {
        continue;
      }
  
      transactions.push(
        normalizeImportedTransaction({
          date:
            parseOfxDate(date),
  
          description,
  
          signedAmount:
            parseBrazilianCurrency(
              amount,
            ),
        }),
      );
    }
  
    return transactions;
  }