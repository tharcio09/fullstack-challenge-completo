import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticipantForm from './ParticipantForm.vue'

describe('ParticipantForm', () => {
  it('deve renderizar o formulário corretamente', () => {
    const wrapper = mount(ParticipantForm)
    
    expect(wrapper.find('input[placeholder="First Name"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Last Name"]').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Participation (%)"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('deve emitir evento add com dados válidos', async () => {
    const wrapper = mount(ParticipantForm)
    
    // Preencher o formulário
    await wrapper.find('input[placeholder="First Name"]').setValue('João')
    await wrapper.find('input[placeholder="Last Name"]').setValue('Silva')
    await wrapper.find('input[placeholder="Participation (%)"]').setValue(30)
    
    // Submeter o formulário
    await wrapper.find('form').trigger('submit.prevent')
    
    // Verificar se o evento foi emitido
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0][0]).toEqual({
      firstName: 'João',
      lastName: 'Silva',
      participation: 30
    })
  })

  it('deve limpar o formulário após submissão', async () => {
    const wrapper = mount(ParticipantForm)
    
    // Preencher o formulário
    await wrapper.find('input[placeholder="First Name"]').setValue('João')
    await wrapper.find('input[placeholder="Last Name"]').setValue('Silva')
    await wrapper.find('input[placeholder="Participation (%)"]').setValue(30)
    
    // Submeter o formulário
    await wrapper.find('form').trigger('submit.prevent')
    
    // Verificar se os campos foram limpos
    expect(wrapper.find('input[placeholder="First Name"]').element.value).toBe('')
    expect(wrapper.find('input[placeholder="Last Name"]').element.value).toBe('')
    expect(wrapper.find('input[placeholder="Participation (%)"]').element.value).toBe('')
  })

  it('não deve emitir evento com dados inválidos', async () => {
    const wrapper = mount(ParticipantForm)
    
    // Tentar submeter formulário vazio
    await wrapper.find('form').trigger('submit.prevent')
    
    // Verificar se nenhum evento foi emitido
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('deve desabilitar botão quando loading é true', () => {
    const wrapper = mount(ParticipantForm, {
      props: {
        loading: true
      }
    })
    
    const button = wrapper.find('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('deve mostrar texto correto no botão quando loading', () => {
    const wrapper = mount(ParticipantForm, {
      props: {
        loading: true
      }
    })
    
    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toBe('Enviando...')
  })

  it('deve validar participation entre 0 e 100', async () => {
    const wrapper = mount(ParticipantForm)
    
    // Testar com valor negativo
    await wrapper.find('input[placeholder="First Name"]').setValue('João')
    await wrapper.find('input[placeholder="Last Name"]').setValue('Silva')
    await wrapper.find('input[placeholder="Participation (%)"]').setValue(-10)
    
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('add')).toBeFalsy()
    
    // Testar com valor maior que 100
    await wrapper.find('input[placeholder="Participation (%)"]').setValue(150)
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted('add')).toBeFalsy()
  })

  it('deve aceitar participation com decimais', async () => {
    const wrapper = mount(ParticipantForm)
    
    await wrapper.find('input[placeholder="First Name"]').setValue('João')
    await wrapper.find('input[placeholder="Last Name"]').setValue('Silva')
    await wrapper.find('input[placeholder="Participation (%)"]').setValue(25.5)
    
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0][0].participation).toBe(25.5)
  })
})
