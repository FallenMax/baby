import m from 'mithril'
import { WiredCard, WiredIconButton } from 'wired-elements'
import { ColorSelect } from '../../component/colorselect/colorselect'
import { NavigationBar } from '../../component/navigation/navigation'
import { showToast } from '../../component/toast/toast'
import { recordService } from '../../service/record.service'
import { showErrorOnFail } from '../../util/client_error'
import { use } from '../../util/use'
import { FormFooter } from '../form/form_footer'
import './custom_manage.scss'
use(WiredCard)
use(WiredIconButton)

export type CustomManagePageAttrs = {}
export const CustomManagePage: m.FactoryComponent<CustomManagePageAttrs> = () => {
  let dom: HTMLElement
  return {
    async oncreate(vnode) {
      dom = vnode.dom as HTMLElement
      window.scrollTo(0, 0)
      await recordService.fetchCustomTypes()
      m.redraw()
    },
    view() {
      return m('#custom-manage', [
        m(NavigationBar, {
          center: m('.title.f-center', 'custom event types'),
        }),
        recordService.customTypesFetched &&
          m(
            '.type-manage-form',
            {
              onsubmit(e) {
                e.stopPropagation()
                e.preventDefault()
              },
            },
            m(
              '.custom-type-guide',
              'want to record something else? add them here:',
            ),
            recordService.customTypes.length
              ? m('.custom-type-list', [
                  recordService.customTypes.map((type) => {
                    const color = type.color?.startsWith('#')
                      ? type.color
                      : recordService.defaultTypeColor
                    return m('.custom-type-item.f-v-center', [
                      m(
                        'wired-icon-button.type-icon',
                        {
                          style: {
                            '--wired-icon-bg-color': color,
                            color: color,
                          },
                          onclick: showErrorOnFail(async () => {
                            const emoji = window.prompt(
                              'emoji for the event:',
                              type.emoji,
                            )
                            if (!emoji || emoji === type.emoji) {
                              return
                            }
                            console.log('emoji.length ', emoji.length)
                            const isEmoji = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])$/.test(
                              emoji,
                            )
                            if (!isEmoji) {
                              return
                            }
                            await recordService.updateCustomType({
                              ...type,
                              emoji,
                            })
                            showToast('updated')
                          }),
                        },
                        type.emoji || recordService.defaultTypeIcon,
                      ),
                      m(
                        '.type-name.f-1',
                        {
                          style: {
                            color,
                          },
                          onclick: showErrorOnFail(async () => {
                            const name = window.prompt(
                              'pick a new name for the type:',
                              type.name,
                            )
                            if (!name || name === type.name) {
                              return
                            }
                            await recordService.updateCustomType({
                              ...type,
                              name,
                            })
                            showToast('updated')
                          }),
                        },
                        type.name,
                      ),
                      m(
                        ColorSelect,
                        {
                          value: color,
                          async onChange(c) {
                            const color = c
                            console.log('color ', color)
                            if (!color) return
                            if (color === type.color) return

                            await recordService.updateCustomType({
                              ...type,
                              color,
                            })
                            showToast('updated')
                            m.redraw()
                          },
                        },
                        m('.color-button', 'color'),
                      ),

                      m(
                        '.delete-button',
                        {
                          onclick: showErrorOnFail(async () => {
                            await recordService.fetchRecords({ force: true })
                            const existed = recordService.records.find(
                              (r) =>
                                r.type === 'custom' && r.subtype === type.id,
                            )
                            if (existed) {
                              window.alert(
                                `cannot delete, records of this type already exist`,
                              )
                              return
                            }
                            await recordService.deleteCustomType(type.id)
                            showToast('deleted')
                          }),
                        },
                        'delete',
                      ),
                    ])
                  }),
                ])
              : undefined,

            m(FormFooter, [
              m(
                'wired-card.create-button.f-center',
                {
                  elevation: 3,
                  onclick: showErrorOnFail(async () => {
                    const name = window.prompt(
                      'what to record (e.g. drug/bath/play):',
                    )
                    if (!name) {
                      return
                    }
                    await recordService.createCustomType({
                      name,
                      color: recordService.defaultTypeColor,
                      emoji: recordService.defaultTypeIcon,
                    })
                    showToast('added')
                  }),
                },
                'add type',
              ),
            ]),
          ),
      ])
    },
  }
}
