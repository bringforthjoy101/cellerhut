import { Toast, ToastBody, ToastHeader, Spinner, Row, Col } from 'reactstrap'

const logo = (
  <svg viewBox='0 0 139 95' version='1.1' height='14'>
    <defs>
      <linearGradient x1='100%' y1='10.5120544%' x2='50%' y2='89.4879456%' id='linearGradient-1'>
        <stop stopColor='#000000' offset='0%'></stop>
        <stop stopColor='#FFFFFF' offset='100%'></stop>
      </linearGradient>
      <linearGradient x1='64.0437835%' y1='46.3276743%' x2='37.373316%' y2='100%' id='linearGradient-2'>
        <stop stopColor='#EEEEEE' stopOpacity='0' offset='0%'></stop>
        <stop stopColor='#FFFFFF' offset='100%'></stop>
      </linearGradient>
    </defs>
    <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
      <g id='Artboard' transform='translate(-400.000000, -178.000000)'>
        <g id='Group' transform='translate(400.000000, 178.000000)'>
          <path
            d='M-5.68434189e-14,2.84217094e-14 L39.1816085,2.84217094e-14 L69.3453773,32.2519224 L101.428699,2.84217094e-14 L138.784583,2.84217094e-14 L138.784199,29.8015838 C137.958931,37.3510206 135.784352,42.5567762 132.260463,45.4188507 C128.736573,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L6.71554594,44.4188507 C2.46876683,39.9813776 0.345377275,35.1089553 0.345377275,29.8015838 C0.345377275,24.4942122 0.230251516,14.560351 -5.68434189e-14,2.84217094e-14 Z'
            id='Path'
            className='text-primary'
            style={{ fill: 'currentColor' }}
          ></path>
          <path
            d='M69.3453773,32.2519224 L101.428699,1.42108547e-14 L138.784583,1.42108547e-14 L138.784199,29.8015838 C137.958931,37.3510206 135.784352,42.5567762 132.260463,45.4188507 C128.736573,48.2809251 112.33867,64.5239941 83.0667527,94.1480575 L56.2750821,94.1480575 L32.8435758,70.5039241 L69.3453773,32.2519224 Z'
            id='Path'
            fill='url(#linearGradient-1)'
            opacity='0.2'
          ></path>
          <polygon
            id='Path-2'
            fill='#000000'
            opacity='0.049999997'
            points='69.3922914 32.4202615 32.8435758 70.5039241 54.0490008 16.1851325'
          ></polygon>
          <polygon
            id='Path-2'
            fill='#000000'
            opacity='0.099999994'
            points='69.3922914 32.4202615 32.8435758 70.5039241 58.3683556 20.7402338'
          ></polygon>
          <polygon
            id='Path-3'
            fill='url(#linearGradient-2)'
            opacity='0.099999994'
            points='101.428699 0 83.0667527 94.1480575 130.378721 47.0740288'
          ></polygon>
        </g>
      </g>
    </g>
  </svg>
)

const close = (
  <button type='button' className='ml-1 close'>
    <span>×</span>
  </button>
)

const ToastHeaderIcons = () => {
  return (
    <Row className='demo-vertical-spacing'>
      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon='primary'>
            Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a primary icon — check it out!</ToastBody>
        </Toast>
      </Col>
      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon='success'>
          Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a success icon — check it out!</ToastBody>
        </Toast>
      </Col>
      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon='info'>
          Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a info icon — check it out!</ToastBody>
        </Toast>
      </Col>
      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon='danger'>
          Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a danger icon — check it out!</ToastBody>
        </Toast>
      </Col>
      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon='warning'>
          Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a warning icon — check it out!</ToastBody>
        </Toast>
      </Col>
      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon='dark'>
          Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a dark icon — check it out!</ToastBody>
        </Toast>
      </Col>

      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon={<Spinner size='sm' color='primary' />}>
            Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a spinner — check it out!</ToastBody>
        </Toast>
      </Col>

      <Col md='6' sm='12'>
        <Toast>
          <ToastHeader close={close} icon={logo}>
            Celler Hut
          </ToastHeader>
          <ToastBody>This is a toast with a logo — check it out!</ToastBody>
        </Toast>
      </Col>
    </Row>
  )
}
export default ToastHeaderIcons
