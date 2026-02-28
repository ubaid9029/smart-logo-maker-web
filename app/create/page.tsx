import Image from "next/image";
import GetStarted from './business-info/page';
import IndustrySelection from './category/page';
import FontSelection from './font/page';
import CreatingLogos from './generating/page';

export default function Create() {
  return (
    <>
      <GetStarted/>
      <IndustrySelection/>
      <FontSelection/>
      <CreatingLogos/>
    </>
  );
}
