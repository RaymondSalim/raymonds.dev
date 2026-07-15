import React, { RefObject } from 'react';
import emailjs from '@emailjs/browser';
import ReactGA from 'react-ga';
import { Input, InputProps } from './Input';
import { GitHub } from '../icons/GitHub';
import { Email } from '../icons/Email';
import { Button } from '../buttons/Button';
import { LinkedIn } from '../icons/LinkedIn';

interface ContactState {
  emailJSFormSent: boolean
  emailSuccessful? : boolean
}
interface ContactProps {}
interface Links {
  url: string,
  icon: React.ReactElement,
  name: string,
}

export class Contact extends React.Component<ContactProps, ContactState> {
  EMAILJS_SERVICEID = 'service_w572sev';
  EMAILJS_TEMPLATEID = 'template_gko1olv';
  EMAILJS_PUBLICKEY = '-OnKer8801FTOADcP';

  formRef: RefObject<HTMLFormElement>;
  inputFields: InputProps[] = [
    {
      type: 'text',
      name: 'name',
      id: 'form-name',
      label: 'Name',
      pattern: '.{2,}',
      required: true,
      className: 'form-input name',
      placeholder: 'Your name',
    }, {
      type: 'email',
      name: 'email',
      id: 'form-email',
      label: 'Email',
      pattern: '[^@ \\t\\r\\n]+@[^@ \\t\\r\\n]+\\.[^@ \\t\\r\\n]+',
      required: true,
      className: 'form-input email',
      placeholder: 'you@awesome.com',
    }, {
      type: 'text',
      name: 'subject',
      id: 'form-subject',
      label: 'Subject',
      pattern: '.{2,}',
      required: true,
      autoComplete: 'off',
      className: 'form-input subject',
      placeholder: 'I would like to chat with you!',
    }, {
      type: 'text',
      name: 'message',
      id: 'form-message',
      label: 'Message',
      pattern: '.{10,}',
      required: true,
      textArea: true,
      resizable: false,
      autoComplete: 'off',
      className: 'form-input message',
      placeholder: 'I would like to talk to you about...',
    },
  ];

  constructor(props: ContactProps) {
    super(props);

    this.state = {
      emailJSFormSent: false,
    };
    this.formRef = React.createRef();
  }

  sendMail = () => {
    ReactGA.event({
      action: 'Clicked send email',
      category: 'User Action',
    });

    if (this.formRef.current === null) return;

    const formData = new FormData(this.formRef.current);
    if (!this.isFormValid(formData)) return;

    emailjs.sendForm(this.EMAILJS_SERVICEID, this.EMAILJS_TEMPLATEID, this.formRef.current, this.EMAILJS_PUBLICKEY)
      .then((res) => {
        let success = false;
        if (res.status === 200) {
          success = true;
        } else {
          ReactGA.exception({
            description: `emailJS API responded with error: \n${JSON.stringify(res, null, 4)}`,
          });
        }

        this.setState({
          emailJSFormSent: true,
          emailSuccessful: success,
        });
      }, (err) => {
        ReactGA.exception({
          description: `Failed to hit emailJS API with error: ${err}`,
        });

        this.setState({
          emailJSFormSent: true,
          emailSuccessful: false,
        });
      });
  };

  isFormValid = (form: FormData) : boolean => {
    let noErrors = true;
    // @ts-ignore
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of form) {
      const target = this.inputFields.find((el) => el.name === key);
      if (target !== undefined) {
        if (target.pattern !== undefined) {
          const regex = new RegExp(target.pattern);
          // eslint-disable-next-line no-continue
          if (regex.test(value)) continue;
        }
      }
      const el = document.querySelector(`[name="${key}"]`) as HTMLInputElement;
      el.classList.toggle('content-invalid', true);
      noErrors = false;
    }
    return noErrors;
  };

  render() {
    const links: Links[] = [
      {
        name: 'GitHub',
        url: 'https://github.com/RaymondSalim',
        icon: (
          <GitHub className={'link-icon'} />
        ),
      }, {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/raymondsalim/',
        icon: (
          <LinkedIn className={'link-icon'} />
        ),
      }, {
        name: 'Email',
        url: 'mailto:raymond@raymonds.dev',
        icon: (
          <Email className={'link-icon'} />
        ),
      },
    ];
    let emailStatus;

    if (this.state.emailJSFormSent) {
      if (this.state.emailSuccessful) {
        emailStatus = (
          <p id={'email-status'} className={'text-green-500 dark:text-green-500'}>Email has been sent successfully!</p>
        );
      } else {
        emailStatus = (
          <p id={'email-status'} className={'text-red-500 dark:text-red-500'}>Failed to send email.</p>
        );
      }
    }
    return (
      <div id="contact-grid">
        <p>My inbox is always open to opportunities! If you have any questions, offers or just want to say hi, send a message and I&apos;ll get back to you!</p>
        <div id={'contact-ways'}>
          <div id={'contact-links'}>
            {
              links.map((el) => (
                <div
                  key={el.name}
                >
                  <a
                    href={el.url}
                  >
                    {el.icon}
                    <span>{el.name}</span>
                  </a>
                </div>
              ))
            }
          </div>
          <form
            ref={this.formRef}
            id={'contact-form'}
          >
            {
              this.inputFields.map((el) => (
                <Input key={el.name} {...el} />
              ))
            }
            { emailStatus }
            <Button
              text="Send Message!"
              className="btn"
              onclick={this.sendMail}
            />
          </form>
        </div>
      </div>
    );
  }
}
