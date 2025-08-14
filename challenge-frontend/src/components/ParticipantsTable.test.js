import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticipantsTable from './ParticipantsTable.vue'

describe('ParticipantsTable', () => {
  const mockParticipants = [
    {
      id: '1',
      firstName: 'João',
      lastName: 'Silva',
      participation: 30
    },
    {
      id: '2',
      firstName: 'Maria',
      lastName: 'Santos',
      participation: 70
    }
  ]

  it('deve renderizar a tabela corretamente', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('deve mostrar cabeçalhos corretos', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    const headers = wrapper.findAll('th')
    expect(headers[0].text()).toBe('First Name')
    expect(headers[1].text()).toBe('Last Name')
    expect(headers[2].text()).toBe('Participation (%)')
    expect(headers[3].text()).toBe('Actions')
  })

  it('deve renderizar participantes corretamente', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    
    const firstRowCells = rows[0].findAll('td')
    expect(firstRowCells[0].text()).toBe('João')
    expect(firstRowCells[1].text()).toBe('Silva')
    expect(firstRowCells[2].text()).toBe('30%')
  })

  it('deve mostrar tabela vazia quando não há participantes', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: []
      }
    })
    
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(0)
  })

  it('deve emitir evento delete quando botão de deletar é clicado', async () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    // Mock do confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    const deleteButtons = wrapper.findAll('.delete-btn')
    await deleteButtons[0].trigger('click')
    
    expect(confirmSpy).toHaveBeenCalledWith('Tem certeza que deseja excluir João Silva?')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0][0]).toBe('1')
    
    confirmSpy.mockRestore()
  })

  it('não deve emitir evento delete quando usuário cancela', async () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    // Mock do confirm retornando false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    
    const deleteButtons = wrapper.findAll('.delete-btn')
    await deleteButtons[0].trigger('click')
    
    expect(confirmSpy).toHaveBeenCalled()
    expect(wrapper.emitted('delete')).toBeFalsy()
    
    confirmSpy.mockRestore()
  })

  it('deve desabilitar botões quando loading é true', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants,
        loading: true
      }
    })
    
    const deleteButtons = wrapper.findAll('.delete-btn')
    deleteButtons.forEach(button => {
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  it('deve formatar participation corretamente', () => {
    const participantsWithDecimals = [
      {
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        participation: 25.5
      }
    ]
    
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: participantsWithDecimals
      }
    })
    
    const participationCell = wrapper.find('tbody tr td:nth-child(3)')
    expect(participationCell.text()).toBe('25.5%')
  })

  it('deve ter tooltip no botão de deletar', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    const deleteButton = wrapper.find('.delete-btn')
    expect(deleteButton.attributes('title')).toBe('Excluir participante')
  })

  it('deve ter ícone de lixeira no botão de deletar', () => {
    const wrapper = mount(ParticipantsTable, {
      props: {
        participants: mockParticipants
      }
    })
    
    const deleteButton = wrapper.find('.delete-btn')
    expect(deleteButton.text()).toBe('🗑️')
  })
})
