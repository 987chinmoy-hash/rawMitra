import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppState, useAppDispatch, getCurrentArtisan } from '../../context/AppContext.jsx'
import { groupRequests, findSupplierOffers } from '../../utils/matching.js'
import { splitCost, compareSoloVsGroup } from '../../utils/pricing.js'
import { useTranslation } from '../../utils/i18n.js'
import Stepper from '../../components/Stepper.jsx'
import RatingStars from '../../components/RatingStars.jsx'
import './artisan.css'

export default function ArtisanMatching() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const artisan =
    getCurrentArtisan(state) ||
    (state.authUser?.role === 'artisan' ? state.authUser : null)
  const { t } = useTranslation()

  const [selectedOffer, setSelectedOffer] = useState({})
  const [purchaseMode, setPurchaseMode] = useState('group') // 'group' | 'solo'
  const [withdrawnNotice, setWithdrawnNotice] = useState({})

  const myGroups = useMemo(() => {
    if (!artisan) return []

    const allGroups = groupRequests(state.materialRequests)

    return allGroups
      .filter((g) => g.requests.some((r) => r.artisanId === artisan.id))
      .map((g) => ({
        ...g,
        offers: findSupplierOffers(g, state.suppliers),
      }))
  }, [state.materialRequests, state.suppliers, artisan])

  if (!artisan) {
    navigate('/artisan/register')
    return null
  }

  function chooseOffer(groupId, offer) {
    setSelectedOffer((s) => ({
      ...s,
      [groupId]: offer,
    }))
  }

  function handleWithdrawParticipant(requestId, groupId, artisanName) {
    dispatch({
      type: 'WITHDRAW_REQUEST',
      requestId,
    })

    setWithdrawnNotice((prev) => ({
      ...prev,
      [groupId]: `${artisanName || 'A participant'} withdrew. ${t('ruleEnforcedNotice')}`,
    }))
  }

  function confirmGroup(group, chosenOffer, preview, myShare) {
    if (!chosenOffer) return

    dispatch({
      type: 'SET_PENDING_ORDER',
      payload: {
        groupId: group.id,
        category: group.category,
        specification: chosenOffer.specification,
        unit: group.unit,
        totalQuantity:
          purchaseMode === 'solo'
            ? myShare.quantity
            : group.totalQuantity,
        supplierId: chosenOffer.supplierId,
        supplierName: chosenOffer.supplierName,
        pricePerUnit: chosenOffer.pricePerUnit,
        logistics: chosenOffer.logistics,
        transportCharge: chosenOffer.transportCharge,
        validity: chosenOffer.validity,
        purchaseMode,
        materialTotal: preview.materialTotal,
        transportTotal: preview.transportTotal,
        totalCost: preview.totalCost,
        perArtisan: preview.perArtisan,
      },
    })

    // Save workflow progress in the backend.
    // The artisan has completed the matching/deal-selection step
    // and should resume from the confirmation step next time.
    dispatch({
      type: 'UPDATE_PROGRESS',
      current_step: 'deal_selection',
      onboarding_complete: false,
    })

    navigate('/artisan/confirm')
  }

  return (
    <div className="page">
      <Stepper
        steps={['Your details', 'Material needs', 'Match & buy', 'Confirm', 'Track']}
        current={2}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1>{t('matchingTitle')}</h1>
          <p>{t('matchingSub')}</p>
        </div>

        {/* Purchase Mode Toggle: Group Buy vs Buy Alone */}
        <div
          className="mode-toggle-bar"
          role="group"
          aria-label="Purchase Mode"
        >
          <button
            type="button"
            className={`mode-toggle-btn ${
              purchaseMode === 'group' ? 'is-active' : ''
            }`}
            onClick={() => setPurchaseMode('group')}
          >
            👥 {t('groupBuy')}
          </button>

          <button
            type="button"
            className={`mode-toggle-btn ${
              purchaseMode === 'solo' ? 'is-active' : ''
            }`}
            onClick={() => setPurchaseMode('solo')}
          >
            👤 {t('buyAlone')}
          </button>
        </div>
      </div>

      {myGroups.length === 0 && (
        <div className="card">
          <p>{t('noMaterialsListed')}</p>

          <Link
            to="/artisan/materials"
            className="btn btn-outline"
          >
            {t('addMaterialReqBtn')}
          </Link>
        </div>
      )}

      {myGroups.map((group) => {
        const chosen =
          selectedOffer[group.id] || group.offers[0]

        const transportFee = chosen
          ? chosen.transportCharge || 0
          : 0

        // Calculate split cost
        const preview = chosen
          ? splitCost(
              group.totalQuantity,
              chosen.pricePerUnit,
              group.requests,
              transportFee
            )
          : null

        const myShare = preview?.perArtisan.find(
          (p) => p.artisanId === artisan.id
        )

        // Calculate solo comparison
        const soloComparison =
          chosen && myShare
            ? compareSoloVsGroup(
                myShare.quantity,
                chosen.pricePerUnit,
                null,
                transportFee,
                group.requests
              )
            : null

        return (
          <div className="group-card" key={group.id}>
            <div className="group-header">
              <div>
                <h3 style={{ margin: 0 }}>
                  {t(group.category) || group.category} ·{' '}
                  {group.specification}
                </h3>

                <span className="tag tag-green">
                  {purchaseMode === 'solo'
                    ? `${myShare?.quantity || 0} ${
                        group.unit
                      } (${t('soloBuying')})`
                    : `${group.totalQuantity} ${
                        group.unit
                      } ${t('combinedBulk')}`}
                </span>
              </div>

              <span className="tag">
                📍 {group.location}
              </span>
            </div>

            {/* Recalculation Alert if a participant withdrew */}
            {withdrawnNotice[group.id] && (
              <div
                className="badge-recalculated"
                role="alert"
              >
                ⚡{' '}
                <strong>
                  {withdrawnNotice[group.id]}
                </strong>
              </div>
            )}

            {/* Group members list with withdrawal buttons */}
            <div className="group-members">
              <strong>
                {t('groupedWith')} ({group.requests.length}):
              </strong>{' '}

              {group.requests.map((r, idx) => {
                const a = state.artisans.find(
                  (x) => x.id === r.artisanId
                )

                const isMe =
                  r.artisanId === artisan.id

                return (
                  <span
                    key={r.id || idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      margin:
                        '0.2rem 0.5rem 0.2rem 0',
                    }}
                  >
                    <span>
                      {a?.name || r.artisanId} (
                      {r.quantity} {group.unit})
                      {isMe ? ' (you)' : ''}
                    </span>

                    {!isMe && (
                      <button
                        type="button"
                        className="btn-withdraw"
                        title="Simulate participant withdrawal to test Important Rules"
                        onClick={() =>
                          handleWithdrawParticipant(
                            r.id,
                            group.id,
                            a?.name
                          )
                        }
                      >
                        {t('btnWithdraw')}
                      </button>
                    )}
                  </span>
                )
              })}
            </div>

            {group.offers.length === 0 ? (
              <div
                className="tag-rust tag"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                }}
              >
                {t('noSupplierMatch')}{' '}

                <Link
                  to={`/artisan/request?category=${encodeURIComponent(
                    group.category
                  )}&spec=${encodeURIComponent(
                    group.specification
                  )}&unit=${group.unit}&location=${encodeURIComponent(
                    group.location
                  )}`}
                >
                  {t('broadcastDealBtn')}
                </Link>
              </div>
            ) : (
              <>
                <div className="offer-row offer-head">
                  <span>{t('colSupplier')}</span>
                  <span>{t('colUnitPrice')}</span>
                  <span>{t('colTransport')}</span>
                  <span>{t('colValidity')}</span>
                  <span>{t('colRating')}</span>
                  <span>{t('colLogistics')}</span>
                  <span></span>
                </div>

                {group.offers.map((offer) => (
                  <div
                    className="offer-row"
                    key={offer.supplierId}
                  >
                    <span>
                      <strong>
                        {offer.supplierName}
                      </strong>{' '}

                      {offer.nearby && (
                        <span className="tag tag-green">
                          nearby
                        </span>
                      )}{' '}

                      {!offer.meetsMinimum && (
                        <span className="tag tag-rust">
                          below min {offer.minBulkQty}{' '}
                          {group.unit}
                        </span>
                      )}
                    </span>

                    <span>
                      ₹{offer.pricePerUnit} / {group.unit}
                    </span>

                    <span>
                      ₹{offer.transportCharge || 500}{' '}
                      (flat)
                    </span>

                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: '#4a5568',
                      }}
                    >
                      📅{' '}
                      {offer.validity || '2026-09-25'}
                    </span>

                    <span>
                      <RatingStars
                        value={offer.supplierRating}
                      />
                    </span>

                    <span
                      style={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {offer.logistics}
                    </span>

                    <button
                      type="button"
                      className={
                        chosen?.supplierId ===
                        offer.supplierId
                          ? 'btn btn-brass'
                          : 'btn btn-outline'
                      }
                      onClick={() =>
                        chooseOffer(group.id, offer)
                      }
                    >
                      {chosen?.supplierId ===
                      offer.supplierId
                        ? t('btnSelected')
                        : t('btnSelect')}
                    </button>
                  </div>
                ))}

                {/* Solo vs Group Buy Comparison View */}
                {purchaseMode === 'solo' &&
                  soloComparison && (
                    <div className="solo-comparison-card">
                      <h4
                        style={{
                          margin: '0 0 0.4rem',
                          color: '#7a4f01',
                        }}
                      >
                        {t('soloHeading')}
                      </h4>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                        }}
                      >
                        {t('soloDesc')}
                      </p>

                      <div className="solo-comparison-grid">
                        <div className="solo-box">
                          <strong>
                            {t('soloRetailBox')}
                          </strong>

                          <div>
                            Unit Price: ₹
                            {soloComparison.solo.unitPrice}{' '}
                            / {group.unit}
                          </div>

                          <div>
                            Material: ₹
                            {soloComparison.solo.materialCost.toLocaleString(
                              'en-IN'
                            )}
                          </div>

                          <div>
                            Transport: ₹
                            {soloComparison.solo.transport.toLocaleString(
                              'en-IN'
                            )}
                          </div>

                          <hr
                            style={{
                              margin: '0.4rem 0',
                              border: 'none',
                              borderTop:
                                '1px solid #e2e8f0',
                            }}
                          />

                          <strong>
                            Total: ₹
                            {soloComparison.solo.total.toLocaleString(
                              'en-IN'
                            )}
                          </strong>
                        </div>

                        <div
                          className="solo-box"
                          style={{
                            borderColor: 'var(--brass)',
                            background: '#fffcf5',
                          }}
                        >
                          <strong>
                            {t('groupWholesaleBox')}
                          </strong>

                          <div>
                            Unit Price: ₹
                            {soloComparison.group.unitPrice}{' '}
                            / {group.unit}
                          </div>

                          <div>
                            Material: ₹
                            {soloComparison.group.materialCost.toLocaleString(
                              'en-IN'
                            )}
                          </div>

                          <div>
                            Transport Share: ₹
                            {soloComparison.group.transportShare.toLocaleString(
                              'en-IN'
                            )}
                          </div>

                          <hr
                            style={{
                              margin: '0.4rem 0',
                              border: 'none',
                              borderTop:
                                '1px solid #e2e8f0',
                            }}
                          />

                          <strong>
                            Your Share: ₹
                            {soloComparison.group.total.toLocaleString(
                              'en-IN'
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="savings-highlight">
                        🎉 {t('soloSavingsCallout')} ₹
                        {soloComparison.savings.toLocaleString(
                          'en-IN'
                        )}{' '}
                        ({soloComparison.savingsPct}
                        %)!
                      </div>
                    </div>
                  )}

                {/* Live Cost Split Breakdown */}
                {preview && (
                  <div className="cost-calc">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong>
                        {t('costSplitHeading')} — Total: ₹
                        {preview.totalCost.toLocaleString(
                          'en-IN'
                        )}
                      </strong>

                      <span className="field-hint">
                        Material: ₹
                        {preview.materialTotal.toLocaleString(
                          'en-IN'
                        )}{' '}
                        | Transport: ₹
                        {preview.transportTotal.toLocaleString(
                          'en-IN'
                        )}
                      </span>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th>{t('colArtisan')}</th>
                          <th>{t('colQuantity')}</th>
                          <th>{t('materialCost')}</th>
                          <th>{t('transportShare')}</th>
                          <th>{t('totalPayable')}</th>
                          <th></th>
                        </tr>
                      </thead>

                      <tbody>
                        {preview.perArtisan.map((p) => {
                          const a =
                            state.artisans.find(
                              (x) =>
                                x.id === p.artisanId
                            )

                          const isMe =
                            p.artisanId === artisan.id

                          return (
                            <tr
                              key={p.artisanId}
                              style={
                                isMe
                                  ? {
                                      fontWeight: 700,
                                      background:
                                        'rgba(192, 138, 40, 0.08)',
                                    }
                                  : {}
                              }
                            >
                              <td>
                                {a?.name || p.artisanId}
                                {isMe ? ' (you)' : ''}
                              </td>

                              <td>
                                {p.quantity} {group.unit}
                              </td>

                              <td>
                                ₹
                                {p.materialCost.toLocaleString(
                                  'en-IN'
                                )}
                              </td>

                              <td>
                                ₹
                                {p.transportShare.toLocaleString(
                                  'en-IN'
                                )}
                              </td>

                              <td>
                                ₹
                                {p.totalCost.toLocaleString(
                                  'en-IN'
                                )}
                              </td>

                              <td>
                                {!isMe && (
                                  <button
                                    type="button"
                                    className="btn-withdraw"
                                    onClick={() =>
                                      handleWithdrawParticipant(
                                        group.requests.find(
                                          (r) =>
                                            r.artisanId ===
                                            p.artisanId
                                        )?.id,
                                        group.id,
                                        a?.name
                                      )
                                    }
                                  >
                                    {t('btnWithdraw')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'center',
                        marginTop: '1rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '1.05rem',
                          }}
                        >
                          {t('yourTotalShare')}:{' '}
                          <strong>
                            ₹
                            {myShare?.totalCost.toLocaleString(
                              'en-IN'
                            )}
                          </strong>{' '}
                          <span
                            style={{
                              fontSize: '0.85rem',
                              color:
                                'var(--ink-soft)',
                            }}
                          >
                            (₹
                            {myShare?.materialCost}{' '}
                            material + ₹
                            {myShare?.transportShare}{' '}
                            transport)
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '0.8rem',
                            color:
                              'var(--ink-soft)',
                          }}
                        >
                          {t('quoteGuaranteedUntil')}{' '}
                          {chosen.validity ||
                            '2026-09-25'}{' '}
                          ({chosen.supplierName}).
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          confirmGroup(
                            group,
                            chosen,
                            preview,
                            myShare
                          )
                        }
                      >
                        {t('btnProceedConfirm')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
