import { LegalLayout } from '@/components/legal/LegalLayout';
import { businessConfig } from '@/config/business';

export const metadata = {
  title: '결제 및 환불정책 - 내 상대 사용설명서',
};

export default function RefundPage() {
  return (
    <LegalLayout title="결제 및 환불정책">
      <h2>1. 유료 상품 개요</h2>
      <ul>
        <li><strong>상품명:</strong> 내 상대 사용설명서 (개인화 디지털 상세 리포트)</li>
        <li><strong>결제금액:</strong> 2,900원</li>
        <li><strong>결제방식:</strong> 1회 결제 (정기구독 아님)</li>
        <li><strong>제공형태:</strong> 온라인 열람 링크 및 PDF 저장 기능 지원</li>
      </ul>

      <h2>2. 환불 정책의 핵심 원칙</h2>
      <p>본 상품은 사용자가 입력한 특정 데이터를 기반으로 즉시 생성되는 '맞춤형 개인화 디지털 콘텐츠'입니다.</p>
      
      <h3>가. 청약철회 (환불) 가능 안내</h3>
      <p>결제를 완료하였으나, <strong>개인화 리포트 생성이 아직 시작되지 않았거나 서비스가 전혀 제공되지 않은 상태</strong>라면 관계 법령 및 회사 정책에 따라 결제 취소 및 환불을 요청하실 수 있습니다.</p>

      <h3>나. 청약철회 제한 안내</h3>
      <p>결제 직후 시스템이 대화 분석을 마치고 <strong>개인화 디지털 콘텐츠(상세 리포트)의 생성 및 제공이 개시된 이후에는, 콘텐츠의 특성상 단순 변심에 의한 청약철회(환불)가 제한될 수 있습니다.</strong> (전자상거래 등에서의 소비자보호에 관한 법률 제17조 제2항 제5호 적용)</p>

      <h2>3. 예외적 환불 사유 (별도 처리)</h2>
      <p>위 제한에도 불구하고 다음의 경우에는 환불 및 결제 취소가 가능합니다.</p>
      <ul>
        <li>시스템 오류로 인해 동일한 건이 이중(중복) 결제된 경우</li>
        <li>결제가 정상적으로 승인되었으나, 서버 오류로 인해 최종 보고서가 제공되지 않은 경우</li>
        <li>회사의 귀책사유로 인한 중대한 시스템 오류로 서비스를 이용할 수 없는 경우</li>
        <li>결제 전 고지되거나 표시된 상품 내용과 실제 제공된 리포트의 구조가 중대하게 다른 경우</li>
      </ul>

      <h2>4. 환불 승인 및 절차</h2>
      <p>정당한 환불 요청이 접수되어 승인된 경우, 회사는 관련 법령에 따라 신속하게 결제 취소 및 환급 절차를 진행합니다. 신용카드 결제의 경우 환불 승인일로부터 카드사에 따라 실제 취소 반영까지 영업일 기준 3~7일이 소요될 수 있습니다.</p>

      <h2>5. 환불 문의 접수 방법</h2>
      <p>환불 요청 및 결제 관련 문의는 아래 고객센터 이메일을 통해 접수해 주시기 바랍니다. 문의 접수 시 아래의 정보를 함께 보내주시면 더욱 빠른 처리가 가능합니다.</p>
      <ul>
        <li><strong>주문번호:</strong> (결제 완료 화면 또는 알림톡 참고)</li>
        <li><strong>결제일 및 결제금액:</strong> </li>
        <li><strong>환불 사유:</strong> </li>
      </ul>
      <p className="mt-4 font-bold text-zinc-900">
        고객센터 이메일: <a href={`mailto:${businessConfig.supportEmail}`} className="text-blue-600 font-normal">{businessConfig.supportEmail}</a>
      </p>
    </LegalLayout>
  );
}
